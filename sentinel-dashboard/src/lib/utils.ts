import { IncidentSeverity } from '../types/incident';

export function getSeverityColors(severity: IncidentSeverity) {
  switch (severity) {
    case 'critical':
      return 'bg-red-500/10 text-red-500 border-red-500/30';
    case 'high':
      return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
    case 'medium':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    case 'low':
    default:
      return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
  }
}

export function getTypeIcon(type: string | null) {
  // Can be mapped to specific Lucide icons if desired
  switch(type) {
    case 'medical': return '🏥';
    case 'fight': return '🥊';
    case 'fire': return '🔥';
    case 'suspicious_item': return '🎒';
    case 'theft': return '🏃';
    default: return '⚠️';
  }
}
