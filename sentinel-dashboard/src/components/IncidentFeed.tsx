'use client';

import { Incident } from '../types/incident';
import { formatDistanceToNow } from 'date-fns';
import { getSeverityColors, getTypeIcon } from '../lib/utils';
import { Check, ShieldAlert, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface IncidentFeedProps {
  incidents: Incident[];
  onUpdateStatus: (id: string, status: string) => void;
}

export function IncidentFeed({ incidents, onUpdateStatus }: IncidentFeedProps) {
  if (incidents.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-slate-500 font-mono text-sm border border-slate-800 rounded-xl bg-[#0a0e1a]/50">
        NO ACTIVE INCIDENTS
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto no-scrollbar pr-2 space-y-3">
      <AnimatePresence>
        {incidents.map((incident) => {
          const colors = getSeverityColors(incident.parsed_severity);
          const isCritical = incident.parsed_severity === 'critical';
          
          return (
            <motion.div
              key={incident.id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`relative glass-panel rounded-lg p-4 border ${colors} ${isCritical ? 'animate-pulse-critical' : ''}`}
            >
              {/* Needs Review Flag */}
              {incident.needs_review && (
                <div className="absolute -top-2 -right-2 bg-yellow-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg border border-yellow-300 z-10">
                  <AlertTriangle className="w-3 h-3" /> REVIEW
                </div>
              )}

              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg" title={incident.parsed_type || 'Unknown'}>{getTypeIcon(incident.parsed_type)}</span>
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${colors}`}>
                    {incident.parsed_severity}
                  </span>
                  <span className="text-slate-400 text-xs font-mono">
                    {incident.created_at ? formatDistanceToNow(new Date(incident.created_at), { addSuffix: true }) : 'Just now'}
                  </span>
                </div>
                {incident.status === 'dispatched' && (
                  <span className="text-blue-400 text-[10px] font-bold tracking-wider flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" /> EN ROUTE
                  </span>
                )}
              </div>

              <div className="mb-3">
                <h3 className="text-white font-semibold text-sm mb-1">{incident.parsed_location || 'Unknown Location'}</h3>
                <p className="text-slate-300 text-sm leading-snug">{incident.parsed_summary}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {incident.status === 'new' && (
                  <button 
                    onClick={() => onUpdateStatus(incident.id!, 'acknowledged')}
                    className="flex-1 bg-[#1e293b] hover:bg-white/10 text-white text-xs font-medium py-1.5 rounded transition-colors"
                  >
                    ACKNOWLEDGE
                  </button>
                )}
                {(incident.status === 'new' || incident.status === 'acknowledged') && (
                  <button 
                    onClick={() => onUpdateStatus(incident.id!, 'dispatched')}
                    className="flex-1 bg-blue-600/80 hover:bg-blue-600 text-white text-xs font-medium py-1.5 rounded transition-colors flex justify-center items-center gap-1"
                  >
                    DISPATCH UNIT
                  </button>
                )}
                {incident.status === 'dispatched' && (
                  <button 
                    onClick={() => onUpdateStatus(incident.id!, 'resolved')}
                    className="w-full bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs font-medium py-1.5 rounded transition-colors flex justify-center items-center gap-1 border border-emerald-500/50"
                  >
                    <Check className="w-3 h-3" /> MARK RESOLVED
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
