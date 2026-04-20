'use client';

import { useState } from 'react';
import { Send, Zap, MessageSquare } from 'lucide-react';

const SAMPLE_MESSAGES = [
  "Huge medical emergency in Sunil Gavaskar Pavilion, someone collapsed!",
  "Suspicious bag left unattended near Gate 3",
  "Two drunk guys having a massive fight in North Stand row 5",
  "Smoke coming from the food stall near Gate 1",
  "Someone just stole my phone at Level 1 Concourse",
];

export function SimulatorPanel() {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const sendMessage = async (text: string, senderIdOverride?: string) => {
    setIsSending(true);
    try {
      await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: text,
          sender_id: senderIdOverride || `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`
        }),
      });
      setMessage('');
    } catch (e) {
      console.error("Failed to send message", e);
    } finally {
      setIsSending(false);
    }
  };

  const fireBurst = async () => {
    for (const msg of SAMPLE_MESSAGES) {
      await sendMessage(msg);
      await new Promise(r => setTimeout(r, 500)); // 500ms delay between burst
    }
  };

  return (
    <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-4 flex flex-col h-full shadow-lg">
      <div className="flex items-center gap-2 mb-4 border-b border-[#1e293b] pb-3">
        <MessageSquare className="w-5 h-5 text-blue-400" />
        <h2 className="text-white font-semibold text-sm tracking-wide">SMS SIMULATOR</h2>
      </div>

      <div className="flex-1 overflow-y-auto mb-4 space-y-2 no-scrollbar">
        {SAMPLE_MESSAGES.map((msg, idx) => (
          <button
            key={idx}
            onClick={() => sendMessage(msg)}
            disabled={isSending}
            className="w-full text-left text-xs bg-[#1e293b] hover:bg-[#2d3b55] text-gray-300 p-2.5 rounded-md transition-colors border border-transparent hover:border-blue-500/30 truncate"
          >
            "{msg}"
          </button>
        ))}
      </div>

      <div className="mt-auto space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type custom report..."
            className="flex-1 bg-[#1e293b] text-white text-sm rounded-md px-3 py-2 border border-[#334155] focus:outline-none focus:border-blue-500"
            onKeyDown={(e) => e.key === 'Enter' && message && sendMessage(message)}
          />
          <button
            onClick={() => sendMessage(message)}
            disabled={!message || isSending}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-2 rounded-md transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={fireBurst}
          disabled={isSending}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500/20 to-orange-500/20 hover:from-red-500/30 hover:to-orange-500/30 text-orange-400  border border-orange-500/30 py-2 rounded-md text-xs font-bold tracking-wider transition-all"
        >
          <Zap className="w-4 h-4" />
          FIRE STRESS TEST BURST
        </button>

        <button
          onClick={() => sendMessage("Help, someone is threatening me near the concourse!", "+919999999991")}
          disabled={isSending}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 text-emerald-400 border border-emerald-500/30 py-2 rounded-md text-xs font-bold tracking-wider transition-all"
        >
          <Zap className="w-4 h-4" />
          TEST GROUP ALERT (ALICE)
        </button>
      </div>
    </div>
  );
}
