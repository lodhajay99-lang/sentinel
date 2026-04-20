export type IncidentType = 'fight' | 'medical' | 'fire' | 'suspicious_item' | 'theft' | 'vandalism' | 'crowd_surge' | 'intoxication' | 'other';
export type IncidentIntent = 'report_incident' | 'request_help' | 'information' | 'complaint';
export type IncidentSeverity = 'critical' | 'high' | 'medium' | 'low' | 'unknown';
export type IncidentStatus = 'new' | 'acknowledged' | 'dispatched' | 'resolved';

export interface Incident {
  id?: string;
  raw_text: string;
  parsed_type: IncidentType | null;
  parsed_intent: IncidentIntent | null;
  parsed_location: string | null;
  parsed_severity: IncidentSeverity;
  parsed_summary: string | null;
  status: IncidentStatus;
  needs_review: boolean;
  review_reason: string | null;
  sender_id: string | null;
  created_at?: string;
  updated_at?: string;
}
