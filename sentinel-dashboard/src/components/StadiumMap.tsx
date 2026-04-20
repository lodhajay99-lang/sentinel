'use client';

import { Incident } from '../types/incident';
import { useMemo } from 'react';
import { useGroupContext } from '../hooks/GroupContext';

// Define a simplified interactive SVG map of Wankhede sections
// We use basic polygons to represent stands around a central pitch
const STADIUM_SVG_DATA = [
  { id: 'North Stand', points: '250,50 350,50 400,100 200,100' },
  { id: 'Sunil Gavaskar Pavilion', points: '400,100 500,200 450,250 350,150' },
  { id: 'Vithalrao Patil Stand', points: '500,200 500,350 450,300 450,250' },
  { id: 'MCA Pavilion', points: '500,350 400,450 350,400 450,300' },
  { id: 'Garware Pavilion', points: '400,450 200,450 250,400 350,400' },
  { id: 'Vijay Merchant Pavilion', points: '200,450 100,350 150,300 250,400' },
  { id: 'Sachin Tendulkar Stand', points: '100,350 100,200 150,250 150,300' },
  { id: 'Divecha Pavilion', points: '100,200 200,100 250,150 150,250' },
];

// Rough center points for markers
const SECTION_COORDS: Record<string, { x: number, y: number }> = {
  'North Stand': { x: 300, y: 75 },
  'Sunil Gavaskar Pavilion': { x: 425, y: 175 },
  'Vithalrao Patil Stand': { x: 475, y: 275 },
  'MCA Pavilion': { x: 400, y: 375 },
  'Garware Pavilion': { x: 300, y: 425 },
  'Vijay Merchant Pavilion': { x: 175, y: 350 },
  'Sachin Tendulkar Stand': { x: 125, y: 250 },
  'Divecha Pavilion': { x: 175, y: 175 },
  'Gate 3': { x: 350, y: 60 },
  'Gate 1': { x: 250, y: 60 },
};

export function StadiumMap({ incidents }: { incidents: Incident[] }) {
  const { activeGroup } = useGroupContext();

  const isGroupInvolved = useMemo(() => {
    if (!activeGroup) return false;
    return incidents.some(inc => 
      inc.status !== 'resolved' && 
      activeGroup.members.some(member => 
        (inc.parsed_location && member.location.toLowerCase().includes(inc.parsed_location.toLowerCase())) ||
        (inc.parsed_location && inc.parsed_location.toLowerCase().includes(member.location.toLowerCase())) ||
        inc.sender_id === member.phone
      )
    );
  }, [incidents, activeGroup]);

  // Aggregate incidents by location to determine heat/glow intensity
  const heatMap = useMemo(() => {
    const map: Record<string, { count: number, maxSeverity: string }> = {};
    
    // Process active incidents
    incidents.filter(i => i.status !== 'resolved').forEach(inc => {
      const loc = inc.parsed_location || 'unknown';
      if (!map[loc]) map[loc] = { count: 0, maxSeverity: 'low' };
      
      map[loc].count += 1;
      
      // Update max severity
      const severities = { unknown: 0, low: 1, medium: 2, high: 3, critical: 4 };
      if (severities[inc.parsed_severity] > severities[map[loc].maxSeverity as keyof typeof severities]) {
        map[loc].maxSeverity = inc.parsed_severity;
      }
    });
    
    return map;
  }, [incidents]);

  const getStyleForLocation = (locationId: string) => {
    // We try to fuzzy match location. E.g. "Gate 3, North Stand" matches "North Stand"
    const matchedLoc = Object.keys(heatMap).find(key => key.toLowerCase().includes(locationId.toLowerCase()) || locationId.toLowerCase().includes(key.toLowerCase()));
    
    if (!matchedLoc) return { fill: '#1e293b', stroke: '#334155', opacity: 0.7 };
    
    const heat = heatMap[matchedLoc];
    
    if (heat.maxSeverity === 'critical') return { fill: '#ff3b5c', stroke: '#ff0033', opacity: 0.9, filter: 'drop-shadow(0 0 10px rgba(255,59,92,0.8))' };
    if (heat.maxSeverity === 'high') return { fill: '#ffb547', stroke: '#ff9900', opacity: 0.8, filter: 'drop-shadow(0 0 8px rgba(255,181,71,0.6))' };
    if (heat.maxSeverity === 'medium') return { fill: '#3b82f6', stroke: '#2563eb', opacity: 0.7 };
    
    // Base heat based on count
    return { fill: `rgba(59, 130, 246, ${Math.min(0.3 + heat.count * 0.1, 0.7)})`, stroke: '#3b82f6', opacity: 0.8 };
  };

  const getFuzzyCoords = (locationId: string) => {
     const matched = Object.keys(SECTION_COORDS).find(key => key.toLowerCase().includes(locationId.toLowerCase()) || locationId.toLowerCase().includes(key.toLowerCase()));
     if (matched) return SECTION_COORDS[matched];
     // Add a little jitter for unknown so they don't exactly overlap
     return { x: 300 + Math.random() * 20 - 10, y: 275 + Math.random() * 20 - 10 }; 
  };

  return (
    <div className="relative w-full h-[500px] flex items-center justify-center bg-[#0a0e1a]/40 rounded-xl border border-slate-800/50 p-4 overflow-hidden">
      
      {/* Decorative Pitch Background */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
        <div className="w-[300px] h-[300px] rounded-full border border-dashed border-slate-500 animate-[spin_60s_linear_infinite]" />
      </div>

      <svg viewBox="0 0 600 550" className="w-full h-full drop-shadow-2xl z-10 transition-all duration-500 hover:scale-105">
        
        {/* Central Pitch */}
        <ellipse cx="300" cy="275" rx="50" ry="80" fill="#1e293b" stroke="#334155" strokeWidth="2" />
        <rect x="285" y="235" width="30" height="80" fill="#0f172a" stroke="#475569" strokeWidth="1" />

        {/* Dynamic Stands */}
        {STADIUM_SVG_DATA.map((section) => {
          const style = getStyleForLocation(section.id);
          const hasAction = style.fill !== '#1e293b';
          
          return (
            <g key={section.id} className="group cursor-crosshair">
              <polygon 
                points={section.points} 
                fill={style.fill} 
                stroke={style.stroke} 
                strokeWidth="2"
                style={{
                   transition: 'all 0.5s ease',
                   filter: (style as any).filter || 'none'
                }}
                className={`hover:brightness-125 ${hasAction && style.fill === '#ff3b5c' ? 'animate-pulse-critical' : ''}`}
              />
              <title>{section.id} {hasAction ? `- ACTIVE REPORTS` : ''}</title>
            </g>
          );
        })}

        {/* Group Member Locators (Only shown if group is involved in an incident) */}
        {isGroupInvolved && activeGroup && activeGroup.members.map((member, idx) => {
          const coords = getFuzzyCoords(member.location);
          return (
            <g key={member.id} className="animate-bounce" style={{ animationDelay: `${idx * 0.2}s` }}>
              {/* Pulsing ring */}
              <circle cx={coords.x} cy={coords.y} r="15" fill="none" stroke="#10b981" strokeWidth="2" className="animate-ping" style={{ transformOrigin: `${coords.x}px ${coords.y}px` }} />
              {/* Inner secure dot */}
              <circle cx={coords.x} cy={coords.y} r="6" fill="#10b981" stroke="#047857" strokeWidth="2" filter="drop-shadow(0 0 5px rgba(16,185,129,0.8))" />
              <text x={coords.x + 12} y={coords.y + 4} fill="#10b981" fontSize="10" fontWeight="bold" filter="drop-shadow(0 0 2px black)">
                {member.name}
              </text>
            </g>
          );
        })}
      </svg>
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-2 bg-black/40 backdrop-blur px-3 py-2 rounded-lg border border-slate-800">
        <div className="flex gap-3 text-[10px] font-mono text-slate-400">
           <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#ff3b5c] shadow-[0_0_5px_#ff3b5c]"></div> Critical</div>
           <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#ffb547]"></div> High</div>
           <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#3b82f6]"></div> Medium</div>
        </div>
        {isGroupInvolved && (
          <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-400 font-bold border-t border-slate-700/50 pt-2 mt-1">
             <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></div>
             GROUP EVACUATION / LOCATOR ACTIVE
          </div>
        )}
      </div>

      <div className="absolute top-4 left-4 flex gap-2">
        <div className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded text-xs font-mono font-bold tracking-[0.2em]">
          WANKHEDE SECTOR MAP
        </div>
        {activeGroup && (
          <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded text-xs font-mono font-bold tracking-widest flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
            GROUP: {activeGroup.familyName.toUpperCase()}
          </div>
        )}
      </div>

    </div>
  );
}
