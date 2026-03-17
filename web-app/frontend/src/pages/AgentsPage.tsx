import React, { useState, useEffect } from 'react';
import ShipScene from '../components/ShipScene';
import { OceanCanvas } from '../components/OceanCanvas';

const LOG_MESSAGES = [
  "Sailing through the silent night of the Grand Line...",
  "Luffy found a new prompt idea on the horizon",
  "Usopp landed a perfect shot — SEO prompt done",
  "Zoro is sharpening the code debugging prompts",
  "Sanji is cooking up a fresh UI design",
  "Nami is navigating through market trends",
  "Robin decrypted a complex data structure",
  "Chopper is healing a broken API connection",
  "Entering the Sea of Innovation...",
  "The wind of creativity is blowing strongly",
];

export default function AgentsPage() {
  const [logIndex, setLogIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setLogIndex((prev) => (prev + 1) % LOG_MESSAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#000308] font-sans selection:bg-violet-500/30">
      {/* NATIVE 3D CINEMATIC OCEAN & SHIP */}
      <ShipScene />

      {/* HUD: TOP BAR */}
      <header className="fixed top-0 left-0 w-full h-[52px] z-20 flex items-center justify-between px-8 bg-gradient-to-b from-[#000510]/90 to-transparent">
        <div className="flex items-center gap-3">
          <img src="/logo192.png" className="w-5 h-5 opacity-80" alt="logo" />
          <h1 className="text-white/60 font-mono text-xs tracking-[0.2em] uppercase">The Grand Line</h1>
        </div>
        
        {/* DASHBOARD NAV */}
        <nav className="flex items-center gap-1 bg-white/[0.03] border border-white/10 rounded-2xl p-1 backdrop-blur-xl">
          <button onClick={() => window.location.href = '/'} className="px-4 py-1.5 text-white/40 hover:text-white/80 transition-all text-xs flex items-center gap-2 group">
            <span className="group-hover:rotate-12 transition-transform">✨</span> Home
          </button>
          <button className="px-4 py-1.5 bg-white/10 text-white rounded-xl text-xs flex items-center gap-2 border border-white/10">
            <span className="animate-pulse">⚡</span> Agents
          </button>
          <button className="px-4 py-1.5 text-white/40 hover:text-white/80 transition-all text-xs flex items-center gap-2">
            🚀 Discover
          </button>
          <button className="px-4 py-1.5 text-white/40 hover:text-white/80 transition-all text-xs flex items-center gap-2">
            ✨ Generate
          </button>
          <div className="w-[1px] h-4 bg-white/10 mx-1" />
          <button className="w-7 h-7 flex items-center justify-center text-white/40 hover:text-white/80 transition-all">
            <span className="text-[10px]">✨</span>
          </button>
          <button className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-lg shadow-blue-500/20 active:scale-95">
             Generate <span className="text-[8px]">➜</span>
          </button>
        </nav>
        
        <div className="flex items-center gap-4">
           <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-[10px] text-white/40 font-mono uppercase tracking-wider">Calm Belt: Node-7 Sky</span>
           </div>
        </div>
      </header>

      {/* HUD: BOTTOM LOG */}
      <footer className="fixed bottom-0 left-0 w-full h-[60px] z-20 flex items-center justify-center bg-gradient-to-t from-[#000510]/95 to-transparent">
        <div className="relative w-full max-w-2xl px-4 overflow-hidden h-6">
          <p className="text-[#a78bfa] font-mono text-xs text-center animate-in slide-in-from-right-10 duration-700">
            [{new Date().toLocaleTimeString()}] {LOG_MESSAGES[logIndex]}
          </p>
        </div>
      </footer>

      {/* EXIT BUTTON */}
      <div className="fixed right-8 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-4">
        <button
          onClick={() => window.location.href = '/'}
          className="w-12 h-12 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-center text-white/60 hover:text-white transition-all backdrop-blur-md group"
        >
          <span className="text-xs group-hover:scale-110 transition-transform">X EXIT</span>
        </button>
      </div>

      {/* GLOBAL OVERLAY (Grain/Vignette) */}
      <div className="fixed inset-0 pointer-events-none z-30 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      <div className="fixed inset-0 pointer-events-none z-30 shadow-[inset_0_0_150px_rgba(0,0,0,0.8)]" />
    </div>
  );
}
