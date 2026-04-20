'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, X, Users, Loader2, CheckCircle2 } from 'lucide-react';
import { useGroupContext, TicketGroup } from '../hooks/GroupContext';

interface GroupScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GroupScannerModal({ isOpen, onClose }: GroupScannerModalProps) {
  const { setActiveGroup } = useGroupContext();
  const [ticketData, setTicketData] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleScan = () => {
    if (!ticketData.trim()) return;
    
    setIsExtracting(true);
    
    // Simulate extraction delay and logic
    setTimeout(() => {
      // Create a mock group robustly. In a real scenario, this would call an LLM API.
      const newGroup: TicketGroup = {
        id: `GRP-${Math.floor(Math.random() * 10000)}`,
        familyName: "Scanned Group",
        members: [
          { id: '1', name: 'Alice', location: 'North Stand', phone: '+919999999991' },
          { id: '2', name: 'Bob', location: 'North Stand', phone: '+919999999992' },
          { id: '3', name: 'Charlie', location: 'Garware Pavilion', phone: '+919999999993' },
          { id: '4', name: 'David', location: 'Gate 3', phone: '+919999999994' },
        ]
      };
      
      setActiveGroup(newGroup);
      setIsExtracting(false);
      setSuccess(true);
      
      setTimeout(() => {
        setSuccess(false);
        setTicketData('');
        onClose();
      }, 1500);
      
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        >
          <motion.div 
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="w-full max-w-lg bg-[#0f172a] border border-[#1e293b] rounded-xl shadow-[0_0_50px_rgba(37,99,235,0.1)] overflow-hidden"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-[#1e293b] bg-[#1e293b]/50">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600/20 p-2 rounded-lg text-blue-500">
                  <QrCode className="w-5 h-5" />
                </div>
                <h2 className="text-white font-bold tracking-wide">TICKET SCANNER</h2>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-400">
                Paste raw ticket JSON or text block to extract group members, assign zones, and activate tactical group monitoring.
              </p>

              {!success ? (
                <div className="relative">
                  <textarea
                    value={ticketData}
                    onChange={(e) => setTicketData(e.target.value)}
                    placeholder="e.g. Group: Smith Family. Bob (North Stand), Alice (Gate 3)..."
                    className="w-full h-32 bg-[#1e293b] text-white text-sm rounded-lg p-3 border border-[#334155] focus:outline-none focus:border-blue-500 transition-colors resize-none font-mono placeholder:text-slate-600"
                    disabled={isExtracting}
                  />
                  
                  {isExtracting && (
                    <div className="absolute inset-0 bg-[#0f172a]/80 backdrop-blur-[2px] flex flex-col items-center justify-center rounded-lg border border-blue-500/30">
                      <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
                      <p className="text-blue-400 font-mono text-xs tracking-widest animate-pulse">EXTRACTING ENTITIES...</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-32 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex flex-col items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-2" />
                  <p className="text-emerald-400 font-mono tracking-widest text-sm text-center">
                    GROUP REGISTERED<br />
                    <span className="text-[10px] text-emerald-500/70">TACTICAL MONITORING ACTIVE</span>
                  </p>
                </div>
              )}

              {/* Action */}
              <button
                onClick={handleScan}
                disabled={isExtracting || success || !ticketData.trim()}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 text-white py-3 rounded-lg font-bold tracking-wider transition-all"
              >
                {isExtracting ? (
                  <>PROCESSING TICKET...</>
                ) : (
                  <>
                    <Users className="w-4 h-4" />
                    EXTRACT & REGISTER GROUP
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
