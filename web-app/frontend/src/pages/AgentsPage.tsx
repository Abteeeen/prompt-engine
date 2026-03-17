import React, { useState, useEffect } from 'react';
import ShipScene from '../components/ShipScene';

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

const STRAW_HATS = [
  { id: "luffy", name: "Monkey D. Luffy", bounty: "3,000,000,000", image: "/assets/posters/luffy.png" },
  { id: "zoro", name: "Roronoa Zoro", bounty: "1,111,000,000", image: "/assets/posters/zoro.png" },
  { id: "nami", name: "Nami", bounty: "366,000,000", image: "/assets/posters/nami.png" },
  { id: "usopp", name: "Usopp", bounty: "500,000,000", image: "/assets/posters/usopp.png" },
  { id: "sanji", name: "Sanji", bounty: "1,032,000,000", image: "/assets/posters/sanji.png" },
  { id: "chopper", name: "Chopper", bounty: "1,000", image: "/assets/posters/chopper.png" },
  { id: "robin", name: "Robin", bounty: "930,000,000", image: "/assets/posters/robin.png" },
  { id: "franky", name: "Franky", bounty: "394,000,000", image: "/assets/posters/franky_poster.png" },
  { id: "brook", name: "Brook", bounty: "383,000,000", image: "/assets/posters/brook_poster.png" },
];

export default function AgentsPage() {
  const [logIndex, setLogIndex] = useState(0);
  const [activePosterId, setActivePosterId] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setLogIndex((prev) => (prev + 1) % LOG_MESSAGES.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, []);

  const selectedPirate = STRAW_HATS.find(p => p.id === activePosterId);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#000308] font-sans selection:bg-orange-500/30 text-white">
      {/* NATIVE 3D CINEMATIC OCEAN, SHIP, AND DYNAMIC 3D POSTERS */}
      <ShipScene 
        activePosterId={activePosterId} 
        onPosterToggle={(id) => setActivePosterId(prevId => prevId === id ? null : id)} 
      />

      {/* OVERLAY INFO: Centered, scrollable, and constrained popup */}
      {selectedPirate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-500">
          <div 
            className="bg-black/80 backdrop-blur-2xl border border-white/20 p-6 sm:p-10 rounded-[2rem] w-full max-w-[500px] max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in zoom-in-95 slide-in-from-bottom-10 duration-700 pointer-events-auto"
            style={{ scrollbarWidth: 'none' }}
          >
             <div className="absolute top-6 left-6 w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-black font-black italic -rotate-12 shadow-lg shadow-orange-500/30">
               !
             </div>
             
             <div className="mt-8">
               <h2 className="text-3xl sm:text-4xl font-black italic uppercase mb-1 tracking-tighter text-white">
                 {selectedPirate.name}
               </h2>
               <div className="flex items-center gap-2 mb-6">
                  <span className="text-orange-400 font-mono text-sm uppercase tracking-[0.3em]">Bounty: {selectedPirate.bounty}</span>
                  <div className="h-[1px] flex-1 bg-white/10" />
               </div>
               
               <div className="space-y-6">
                 <p className="text-white/80 text-lg leading-relaxed font-serif italic antialiased">
                   "Navigating the uncharted waters of the Grand Line. This pirate will return to the deck once the bounty is secured."
                 </p>
                 
                 <div className="py-6 border-y border-white/10 text-white/60 text-sm leading-relaxed">
                   <p className="mb-4">
                     <span className="text-orange-400/80 font-bold uppercase tracking-widest text-[10px] block mb-1">Mission Log:</span>
                     Current coordinates: Grand Line - Sector 7. Deployment specialized in complex prompt architectures and tactical SEO maneuvers.
                   </p>
                   <p>
                     <span className="text-orange-400/80 font-bold uppercase tracking-widest text-[10px] block mb-1">Status Report:</span>
                     Weaponry (Prompts) fully optimized for all LLM classes. Expect return upon completion of project milestone.
                   </p>
                 </div>
               </div>

               <div className="flex items-center justify-between mt-10">
                  <div className="flex items-center gap-3">
                     <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50" />
                     <span className="text-xs text-white/40 uppercase tracking-[0.2em] font-bold">In Deployment</span>
                  </div>
                  <button 
                    onClick={() => setActivePosterId(null)}
                    className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-black rounded-full text-xs uppercase font-black tracking-widest transition-all hover:scale-105 active:scale-95 shadow-lg shadow-orange-500/20"
                  >
                    Dismiss
                  </button>
               </div>
             </div>
          </div>
        </div>
      )}

      {/* MINIMAL HUD TOP */}
      <header className="fixed top-0 left-0 w-full h-[60px] z-30 flex items-center justify-between px-8 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-4">
          <img src="/logo192.png" className="w-6 h-6 opacity-90" alt="logo" />
          <div className="h-4 w-[1px] bg-white/20" />
          <h1 className="text-white/50 font-mono text-[10px] tracking-[0.3em] uppercase">Ship Deck Interface</h1>
        </div>
        
        <nav className="flex items-center gap-2">
          <button onClick={() => window.location.href = '/'} className="px-6 py-2 text-white/40 hover:text-white transition-all text-xs font-bold uppercase tracking-widest group">
            <span className="mr-2 group-hover:mr-4 transition-all opacity-0 group-hover:opacity-100">←</span> Home
          </button>
        </nav>
      </header>

      {/* BOTTOM LOG FEED */}
      <footer className="fixed bottom-0 left-0 w-full h-[60px] z-30 flex items-center justify-center bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-center gap-4 px-6 py-2 bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-full antialiased">
             <span className="text-orange-400 font-mono text-xs animate-pulse">●</span>
             <p className="text-white/40 font-mono text-[10px] sm:text-xs uppercase tracking-widest">
                {LOG_MESSAGES[logIndex]}
             </p>
          </div>
      </footer>

      {/* VIGNETTE & FILM GRAIN */}
      <div className="fixed inset-0 pointer-events-none z-40 opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      <div className="fixed inset-0 pointer-events-none z-40 shadow-[inset_0_0_200px_rgba(0,0,0,0.9)]" />
    </div>
  );
}
