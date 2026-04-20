'use client';

import { useState } from 'react';
import { useRealtimeIncidents } from '../hooks/useRealtimeIncidents';
import { StadiumMap } from '../components/StadiumMap';
import { IncidentFeed } from '../components/IncidentFeed';
import { StatsPanel } from '../components/StatsPanel';
import { SimulatorPanel } from '../components/SimulatorPanel';
import { ShieldCheck, Activity, QrCode } from 'lucide-react';
import { GroupProvider } from '../hooks/GroupContext';
import { GroupScannerModal } from '../components/GroupScannerModal';

export default function DashboardPage() {
  const { incidents, loading, updateIncidentStatus } = useRealtimeIncidents();
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  if (loading && incidents.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Activity className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-slate-400 font-mono tracking-widest text-sm text-center">
            ESTABLISHING SECURE UPLINK...<br/>
            <span className="text-blue-500 text-xs">Waiting for Supabase connection</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <GroupProvider>
      <div className="min-h-screen bg-background p-4 flex flex-col h-screen overflow-hidden">
      
      {/* Header */}
      <header className="flex justify-between items-center mb-6 px-2">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg shadow-[0_0_15px_rgba(37,99,235,0.5)]">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white mb-0 leading-none">PROJECT SENTINEL</h1>
            <p className="text-blue-400 text-xs font-mono tracking-[0.2em] uppercase">Tactical Triage Network</p>
          </div>
        </div>
        
        <div className="flex gap-4">
           <button 
             onClick={() => setIsScannerOpen(true)}
             className="flex items-center gap-2 px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded text-blue-400 text-xs font-mono font-bold transition-colors shadow-lg shadow-blue-900/20"
           >
             <QrCode className="w-3 h-3" />
             GROUP TICKETING
           </button>
           <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-emerald-400 text-xs font-mono">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
             SYSTEM ONLINE
           </div>
           <div className="text-right">
             <div className="text-white text-sm font-bold">{new Date().toLocaleTimeString()}</div>
             <div className="text-slate-400 text-[10px] uppercase">Wankhede Server</div>
           </div>
        </div>
      </header>

      {/* Stats row */}
      <StatsPanel incidents={incidents} />

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        
        {/* Left Column: UI / Interaction */}
        <div className="col-span-3 flex flex-col gap-6 min-h-0">
          <div className="flex-1 min-h-0">
             <SimulatorPanel />
          </div>
        </div>

        {/* Center: Intelligence Map */}
        <div className="col-span-6 flex flex-col min-h-0">
           <div className="flex-1 glass-panel rounded-xl p-1 relative flex items-center justify-center shadow-2xl">
              <StadiumMap incidents={incidents} />
           </div>
        </div>

        {/* Right Column: Tactical Feed */}
        <div className="col-span-3 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-3 px-1">
             <h2 className="text-white font-semibold text-sm tracking-widest uppercase">Live Feed</h2>
             <span className="text-slate-400 text-xs">{incidents.length} events</span>
          </div>
          <div className="flex-1 min-h-0">
             <IncidentFeed incidents={incidents} onUpdateStatus={updateIncidentStatus} />
          </div>
        </div>

      </div>
      </div>
      
      <GroupScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} />
    </GroupProvider>
  );
}
