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
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const handleLuffyClick = () => setShowPopup(true);
    window.addEventListener('luffy-clicked', handleLuffyClick);
    
    const interval = setInterval(() => {
      setLogIndex((prev) => (prev + 1) % LOG_MESSAGES.length);
    }, 4000);
    
    return () => {
      window.removeEventListener('luffy-clicked', handleLuffyClick);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#000308] font-sans selection:bg-violet-500/30">
      {/* NATIVE 3D CINEMATIC OCEAN & SHIP */}
      <ShipScene />

      {/* CHARACTER POPUP */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-md bg-[#000814]/90 border border-white/10 rounded-3xl p-8 backdrop-blur-2xl shadow-2xl shadow-blue-500/10 animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setShowPopup(false)}
              className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors"
            >
              <span className="text-xl">✕</span>
            </button>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-orange-500 to-red-500 p-1 mb-6 shadow-lg shadow-orange-500/20">
                <div className="w-full h-full rounded-full bg-[#000814] flex items-center justify-center text-4xl">
                  👒
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-1 tracking-tight">Monkey D. Luffy</h2>
              <p className="text-orange-400 font-mono text-xs uppercase tracking-[0.3em] mb-6">The Idea Agent</p>
              
              <div className="w-full space-y-4 text-left">
                <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                  <h3 className="text-white/40 text-[10px] uppercase tracking-wider mb-2">Primary Objective</h3>
                  <p className="text-white/80 text-sm leading-relaxed">
                    Transforming raw concepts into legendary prompt architectures. Exploring the Sea of Innovation to find the One Piece of perfect output.
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                    <h3 className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Status</h3>
                    <p className="text-green-400 text-sm font-semibold">Ready to Sail</p>
                  </div>
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                    <h3 className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Morale</h3>
                    <p className="text-orange-400 text-sm font-semibold">Meat Obsessed</p>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => setShowPopup(false)}
                className="mt-8 w-full py-4 bg-white text-black font-bold rounded-2xl hover:bg-white/90 transition-all active:scale-[0.98]"
              >
                Set Sail
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HUD: TOP BAR */}
      <header className="fixed top-0 left-0 w-full h-[52px] z-20 flex items-center justify-between px-4 sm:px-8 bg-gradient-to-b from-[#000510]/90 to-transparent">
        <div className="flex items-center gap-3">
          <img src="/logo192.png" className="w-4 h-4 sm:w-5 sm:h-5 opacity-80" alt="logo" />
          <h1 className="text-white/60 font-mono text-[10px] sm:text-xs tracking-[0.2em] uppercase truncate max-w-[80px] sm:max-w-none">The Grand Line</h1>
        </div>
        
        {/* DASHBOARD NAV */}
        <nav className="flex items-center gap-0.5 sm:gap-1 bg-white/[0.03] border border-white/10 rounded-2xl p-0.5 sm:p-1 backdrop-blur-xl mx-2">
          <button onClick={() => window.location.href = '/'} className="px-2 sm:px-4 py-1.5 text-white/40 hover:text-white/80 transition-all text-[10px] sm:text-xs flex items-center gap-1 sm:gap-2 group">
            <span className="group-hover:rotate-12 transition-transform">✨</span> <span className="hidden xs:inline">Home</span>
          </button>
          <button className="px-2 sm:px-4 py-1.5 bg-white/10 text-white rounded-xl text-[10px] sm:text-xs flex items-center gap-1 sm:gap-2 border border-white/10">
            <span className="animate-pulse">⚡</span> Agents
          </button>
          <button className="hidden md:flex px-4 py-1.5 text-white/40 hover:text-white/80 transition-all text-xs items-center gap-2">
            🚀 Discover
          </button>
          <button className="hidden lg:flex px-4 py-1.5 text-white/40 hover:text-white/80 transition-all text-xs items-center gap-2">
            ✨ Generate
          </button>
          <div className="hidden sm:block w-[1px] h-4 bg-white/10 mx-1" />
          <button className="bg-blue-600 hover:bg-blue-500 text-white text-[9px] sm:text-[10px] font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg flex items-center gap-1 transition-all shadow-lg shadow-blue-500/20 active:scale-95">
             <span className="hidden sm:inline">Generate</span> <span className="text-[8px]">➜</span>
          </button>
        </nav>
        
        <div className="hidden sm:flex items-center gap-4">
           <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-[10px] text-white/40 font-mono uppercase tracking-wider">Node-7 Sky</span>
           </div>
        </div>
      </header>

      {/* HUD: BOTTOM LOG */}
      <footer className="fixed bottom-0 left-0 w-full h-[60px] z-20 flex items-center justify-center bg-gradient-to-t from-[#000510]/95 to-transparent pb-4 sm:pb-0">
        <div className="relative w-full max-w-2xl px-4 overflow-hidden h-6">
          <p className="text-[#a78bfa] font-mono text-[10px] sm:text-xs text-center animate-in slide-in-from-right-10 duration-700">
            [{new Date().toLocaleTimeString()}] {LOG_MESSAGES[logIndex]}
          </p>
        </div>
      </footer>

      {/* EXIT BUTTON */}
      <div className="fixed right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-4">
        <button
          onClick={() => window.location.href = '/'}
          className="w-10 h-10 sm:w-12 sm:h-12 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex flex-col items-center justify-center text-white/60 hover:text-white transition-all backdrop-blur-md group"
        >
          <span className="text-[8px] sm:text-xs font-bold">X</span>
          <span className="text-[6px] sm:text-[8px] uppercase opacity-60">Exit</span>
        </button>
      </div>

      {/* GLOBAL OVERLAY (Grain/Vignette) */}
      <div className="fixed inset-0 pointer-events-none z-30 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      <div className="fixed inset-0 pointer-events-none z-30 shadow-[inset_0_0_150px_rgba(0,0,0,0.8)]" />
    </div>
  );
}
