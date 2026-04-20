import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const validLocations = [
  'North Stand', 'Sunil Gavaskar Pavilion', 'Vithalrao Patil Stand',
  'MCA Pavilion', 'Grand Stand', 'Garware Pavilion',
  'Vijay Merchant Pavilion', 'Sachin Tendulkar Stand', 'Divecha Pavilion',
  'Gate 1', 'Gate 2', 'Gate 3', 'Gate 4', 'Gate 5', 'Gate 6', 'Gate 7',
  'Level 1 Concourse', 'Level 2 Concourse',
  'VIP Concourse North', 'VIP Concourse South',
  'Pitch Level', 'Dugouts'
];

async function parseWithMock(text: string) {
    const textLower = text.toLowerCase();
    
    let type = 'other';
    let intent = 'information';
    let severity = 'low';
    let location = 'Unknown';
    let summary = text.length > 50 ? text.substring(0, 47) + '...' : text;

    if (textLower.match(/fight|brawl|punch|attack|assault/)) {
        type = 'fight'; severity = 'high'; intent = 'report_incident';
        summary = "Physical altercation reported";
    } else if (textLower.match(/blood|medical|heart|collapse|breathe|ambulance/)) {
        type = 'medical'; severity = 'critical'; intent = 'request_help';
        summary = "Medical emergency reported";
    } else if (textLower.match(/fire|smoke|burn/)) {
        type = 'fire'; severity = 'critical'; intent = 'request_help';
        summary = "Fire/Smoke reported";
    } else if (textLower.match(/bag|backpack|suspicious|bomb/)) {
        type = 'suspicious_item'; severity = 'high'; intent = 'report_incident';
        summary = "Suspicious item reported";
    } else if (textLower.match(/stole|theft|wallet|phone|pickpocket/)) {
        type = 'theft'; severity = 'medium'; intent = 'report_incident';
        summary = "Theft reported";
    }

    if (textLower.match(/gun|weapon|knife|shooting/)) {
        severity = 'critical';
        summary = "CRITICAL: Weapon mentioned";
    }

    for (const validLoc of validLocations) {
        if (textLower.includes(validLoc.toLowerCase())) {
            location = validLoc;
            break;
        }
    }

    if (location === 'Unknown') {
        const fallbackMatch = text.match(/(gate \d|.*? stand|.*? pavilion|level \d)/i);
        if (fallbackMatch) {
            location = fallbackMatch[0].trim();
        }
    }

    // SIMULATE DELAY FOR UI CONSISTENCY
    await new Promise(r => setTimeout(r, 600));

    return { type, intent, location, severity, summary };
}

async function parseWithGemini(text: string) {
    const ai = new GoogleGenAI({}); // Automatically picks up GEMINI_API_KEY from env
    
    const prompt = `You are an expert emergency dispatch NLP extraction engine for Wankhede Stadium.
Your job is to read raw incoming text messages from fans and extract key details into strict JSON.

Valid Wankhede Locations include: ${validLocations.join(', ')}

Guidelines:
1. Extract the specific 'location'. If vague, best match or exact phrase.
2. 'severity': 'critical', 'high', 'medium', 'low', 'unknown'.
3. 'type': 'fight', 'medical', 'fire', 'suspicious_item', 'theft', 'vandalism', 'crowd_surge', 'intoxication', 'other'.
4. 'intent': 'report_incident', 'request_help', 'information', 'complaint'.
5. Provide a concise 'summary' under 100 characters.

Return ONLY valid JSON matching this schema:
{
  "type": "..." ,
  "intent": "...",
  "location": "...",
  "severity": "...",
  "summary": "..."
}
`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt + "\n\nExtract data from this message: " + text,
        config: {
           responseMimeType: "application/json"
        }
    });

    try {
        return JSON.parse(response.text || '{}');
    } catch {
        throw new Error("Invalid output format from Gemini");
    }
}

export async function POST(request: Request) {
    try {
        const { message, sender_id } = await request.json();

        if (!message || typeof message !== 'string') {
            return NextResponse.json({ error: "Message body must contain a 'message' string." }, { status: 400 });
        }

        let rawParsedData;
        const useMock = process.env.USE_MOCK_PARSER === 'true';

        if (!useMock && process.env.GEMINI_API_KEY) {
            try {
                rawParsedData = await parseWithGemini(message);
            } catch (err) {
                console.warn("Gemini failed, falling back to mock parser.", err);
                rawParsedData = await parseWithMock(message);
            }
        } else {
            rawParsedData = await parseWithMock(message);
        }

        // Location Validation
        const loc = rawParsedData?.location || 'Unknown';
        const isLocationValid = validLocations.some(vl => 
            loc.toLowerCase().includes(vl.toLowerCase()) || 
            vl.toLowerCase().includes(loc.toLowerCase())
        );

        const needsReview = !isLocationValid;
        const reviewReason = needsReview ? `Unrecognized Wankhede location: "${loc}"` : null;

        const finalIncident = {
            raw_text: message,
            parsed_type: rawParsedData?.type || 'other',
            parsed_intent: rawParsedData?.intent || 'report_incident',
            parsed_location: loc,
            parsed_severity: rawParsedData?.severity || 'unknown',
            parsed_summary: rawParsedData?.summary || message,
            status: 'new',
            needs_review: needsReview,
            review_reason: reviewReason,
            sender_id: sender_id || null,
        };

        const { data, error } = await supabase
            .from('incidents')
            .insert([finalIncident])
            .select('*')
            .single();

        if (error) {
            console.error("Supabase Error:", error);
            return NextResponse.json({ error: "Failed to persist incident." }, { status: 500 });
        }

        return NextResponse.json({ success: true, incident: data }, { status: 201 });
    } catch (e) {
        console.error("Ingest Error:", e);
        return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }
}
