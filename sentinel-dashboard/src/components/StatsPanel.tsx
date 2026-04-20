'use client';

import { Incident } from '../types/incident';
import { ShieldCheck, AlertOctagon, Clock, Activity } from 'lucide-react';

export function StatsPanel({ incidents }: { incidents: Incident[] }) {
  const activeCount = incidents.filter(i => i.status !== 'resolved').length;
  const criticalCount = incidents.filter(i => i.parsed_severity === 'critical' && i.status !== 'resolved').length;
  const dispatchedCount = incidents.filter(i => i.status === 'dispatched').length;
  const reviewCount = incidents.filter(i => i.needs_review && i.status !== 'resolved').length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      
      <div className="glass-panel p-4 rounded-xl flex items-center justify-between border-l-4 border-l-blue-500">
        <div>
          <p className="text-slate-400 text-xs font-semibold tracking-wider mb-1">ACTIVE QUEUE</p>
          <div className="text-3xl font-bold text-white font-mono">{activeCount}</div>
        </div>
        <div className="bg-blue-500/10 p-3 rounded-lg">
          <Activity className="w-6 h-6 text-blue-400" />
        </div>
      </div>

      <div className={`glass-panel p-4 rounded-xl flex items-center justify-between border-l-4 ${criticalCount > 0 ? 'border-l-red-500 glow-critical' : 'border-l-slate-700'}`}>
        <div>
          <p className="text-slate-400 text-xs font-semibold tracking-wider mb-1">CRITICAL ALERTS</p>
          <div className={`text-3xl font-bold font-mono ${criticalCount > 0 ? 'text-red-500' : 'text-white'}`}>{criticalCount}</div>
        </div>
        <div className={`${criticalCount > 0 ? 'bg-red-500/20' : 'bg-slate-800'} p-3 rounded-lg`}>
          <AlertOctagon className={`w-6 h-6 ${criticalCount > 0 ? 'text-red-500' : 'text-slate-500'}`} />
        </div>
      </div>

      <div className="glass-panel p-4 rounded-xl flex items-center justify-between border-l-4 border-l-emerald-500">
        <div>
          <p className="text-slate-400 text-xs font-semibold tracking-wider mb-1">UNITS DISPATCHED</p>
          <div className="text-3xl font-bold text-white font-mono">{dispatchedCount}</div>
        </div>
        <div className="bg-emerald-500/10 p-3 rounded-lg">
          <ShieldCheck className="w-6 h-6 text-emerald-400" />
        </div>
      </div>

      <div className={`glass-panel p-4 rounded-xl flex items-center justify-between border-l-4 ${reviewCount > 0 ? 'border-l-yellow-500' : 'border-l-slate-700'}`}>
        <div>
          <p className="text-slate-400 text-xs font-semibold tracking-wider mb-1">MANUAL REVIEW</p>
          <div className={`text-3xl font-bold font-mono ${reviewCount > 0 ? 'text-yellow-500' : 'text-white'}`}>{reviewCount}</div>
        </div>
        <div className={`${reviewCount > 0 ? 'bg-yellow-500/10' : 'bg-slate-800'} p-3 rounded-lg`}>
          <Clock className={`w-6 h-6 ${reviewCount > 0 ? 'text-yellow-500' : 'text-slate-500'}`} />
        </div>
      </div>

    </div>
  );
}
