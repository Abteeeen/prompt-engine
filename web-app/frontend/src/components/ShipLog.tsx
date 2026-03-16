import React, { useEffect, useState, useRef } from 'react';

interface LogEntry {
  id: number;
  message: string;
  time: string;
  type: 'info' | 'success' | 'warning';
}

const MESSAGES = [
  "Luffy discovered a raw idea in the horizon.",
  "Nami mapped out a research route for Content Writing.",
  "Zoro sharpened a cold outreach prompt. Accuracy+.",
  "Sanji served a high-flavor SEO prompt. Ready for review.",
  "Chopper diagnosed a prompt. Quality score: 29/30.",
  "Robin loaded ancient context for the Legal domain.",
  "Sailing calm waters near the Sea of Creativity.",
  "Usopp (AI) spotting potential hallucinations... None found.",
  "Franky (Backend) reinforcing the vector database walls.",
  "Brook (Streamer) playing a melody for the Drafter agent."
];

export function ShipLog() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const newEntry: LogEntry = {
        id: Date.now(),
        message: MESSAGES[Math.floor(Math.random() * MESSAGES.length)],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        type: Math.random() > 0.8 ? 'success' : 'info'
      };
      setLogs(prev => [...prev.slice(-15), newEntry]);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="mt-8 glass rounded-2xl overflow-hidden animate-fade-in mx-auto max-w-4xl border border-white/5">
      <div className="px-4 py-2 bg-white/5 border-b border-white/5 flex items-center justify-between">
        <h3 className="text-[10px] uppercase font-black tracking-widest text-white/40">Ship's Log — Grand Line Expedition</h3>
        <div className="flex gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500/50" />
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/50" />
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
        </div>
      </div>
      <div 
        ref={scrollRef}
        className="h-40 overflow-y-auto p-4 space-y-2 font-mono text-[11px] scroll-smooth no-scrollbar"
        style={{ background: 'rgba(0,0,0,0.3)' }}
      >
        {logs.length === 0 && <p className="text-white/20">Awaiting data from the Straw Hat crew...</p>}
        {logs.map(log => (
          <div key={log.id} className="flex gap-4 items-start border-l-2 border-transparent hover:border-purple-500/30 pl-2 transition-all">
            <span className="text-white/20 shrink-0">[{log.time}]</span>
            <span className={`${log.type === 'success' ? 'text-emerald-400' : 'text-gray-400'}`}>
              {log.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
