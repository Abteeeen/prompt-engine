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
  const [showFlash, setShowFlash] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setLogIndex((prev) => (prev + 1) % LOG_MESSAGES.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, []);

  // Trigger cinematic entrance effects
  useEffect(() => {
    if (activePosterId && !isExiting) {
      setShowFlash(true);
      const timer = setTimeout(() => setShowFlash(false), 150);
      return () => clearTimeout(timer);
    }
  }, [activePosterId, isExiting]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      setActivePosterId(null);
      setIsExiting(false);
    }, 400); // Match cut-to-black duration
  };

  const selectedPirate = STRAW_HATS.find(p => p.id === activePosterId);

  return (
    <div className={`relative w-full h-screen overflow-hidden bg-[#000308] font-sans selection:bg-orange-500/30 text-white ${activePosterId && !isExiting ? 'animate-screen-shake' : ''}`}>
      {/* Cinematic White Flash on Impact */}
      {showFlash && <div className="fixed inset-0 z-[100] bg-white animate-white-flash pointer-events-none" />}

      {/* NATIVE 3D CINEMATIC OCEAN, SHIP, AND DYNAMIC 3D POSTERS */}
      <ShipScene 
        activePosterId={activePosterId} 
        onPosterToggle={(id) => id ? setActivePosterId(id) : handleDismiss()} 
      />

      {/* CINEMATIC TITLE CARD OVERLAY */}
      {selectedPirate && (
        <div 
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/40 backdrop-blur-sm pointer-events-none ${isExiting ? 'animate-cut-to-black' : 'animate-in fade-in duration-500'}`}
          onClick={handleDismiss}
        >
          <div className="relative w-full max-w-6xl flex flex-col md:flex-row gap-6 md:gap-12 items-center justify-start md:justify-center pointer-events-auto h-[90vh] md:h-auto md:max-h-[85vh] overflow-y-auto md:overflow-visible no-scrollbar pb-12 md:pb-0">
            
            {/* POSTER LAYER - Crystall Clear, Full Aspect Ratio */}
            <div className={`relative shrink-0 w-[200px] h-[300px] md:w-auto md:flex-1 md:h-full md:max-h-[75vh] md:min-h-[400px] aspect-[2/3] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] md:shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/10 ${isExiting ? '' : 'animate-slam-in'}`}>
              <img 
                src={selectedPirate.image} 
                alt={selectedPirate.name}
                className="w-full h-full object-fill"
                style={{ filter: 'contrast(1.1) brightness(1.05)', opacity: 1 }}
              />
              <div className="film-grain-overlay" />
              <div className="absolute inset-0 poster-vignette" />
            </div>

            {/* INFO LAYER - Slide up with fade */}
            <div 
              className={`flex-1 w-full flex flex-col justify-start md:justify-center max-w-xl animate-in slide-in-from-bottom-20 fade-in duration-1000 delay-300 px-4 md:px-0 ${isExiting ? 'opacity-0' : ''}`}
              onClick={(e) => e.stopPropagation()}
            >
               <div className="mb-2 md:mb-4">
                 <h2 className="text-4xl md:text-5xl lg:text-7xl font-black italic uppercase tracking-tighter text-white animate-typewriter inline-block">
                   {selectedPirate.name}
                 </h2>
                 <div className="h-2 w-full bg-orange-500 mt-2 animate-draw-line" />
               </div>
               
               <div className="flex items-center gap-4 mb-4 md:mb-8">
                  <span className="text-orange-400 font-mono text-lg md:text-2xl uppercase tracking-[0.2em] md:tracking-[0.4em] font-bold">Bounty: {selectedPirate.bounty}</span>
               </div>
               
               <div className="space-y-6 md:space-y-10">
                 <p className="text-white/95 text-lg md:text-2xl leading-relaxed font-serif italic antialiased drop-shadow-2xl">
                   "Navigating the uncharted waters of the Grand Line. This pirate will return to the deck once the bounty is secured."
                 </p>
                 
                 <div className="py-6 md:py-8 border-y border-white/10 text-white/70 text-sm md:text-lg leading-relaxed glass p-6 md:p-8 rounded-3xl">
                   <p className="mb-6">
                     <span className="text-orange-500 font-bold uppercase tracking-widest text-xs block mb-2">Mission Log:</span>
                     Current coordinates: Grand Line - Sector 7. Deployment specialized in complex prompt architectures and tactical SEO maneuvers.
                   </p>
                   <p>
                     <span className="text-orange-500 font-bold uppercase tracking-widest text-xs block mb-2">Status Report:</span>
                     Weaponry (Prompts) fully optimized for all LLM classes. Expect return upon completion of project milestone.
                   </p>
                 </div>
               </div>

               <div className="flex flex-col sm:flex-row items-center justify-between mt-8 md:mt-12 gap-6 sm:gap-0">
                  <div className="flex items-center gap-4">
                     <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.6)]" />
                     <span className="text-xs md:text-sm text-white/60 uppercase tracking-[0.25em] font-black">In Deployment</span>
                  </div>
                  <button 
                    onClick={handleDismiss}
                    className="w-full sm:w-auto px-12 py-4 bg-white text-black hover:bg-orange-500 hover:text-white rounded-none font-black uppercase tracking-[0.3em] transition-all hover:scale-105 active:scale-95 shadow-2xl border-2 border-black"
                  >
                    Dismiss
                  </button>
               </div>
            </div>
          </div>

          {/* ABSOLUTE CLOSE BUTTON - High Visibility for Mobile/Desktop */}
          <button 
            onClick={handleDismiss}
            className="fixed top-6 right-6 z-[60] p-4 text-white/40 hover:text-white transition-all hover:scale-110 active:scale-90 glass rounded-full border border-white/10 group bg-black/20 pointer-events-auto"
            aria-label="Close Poster"
          >
            <svg viewBox="0 0 24 24" className="w-8 h-8 stroke-current fill-none transition-transform group-hover:rotate-90" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
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
