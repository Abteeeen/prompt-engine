import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { ShipCanvas } from '../components/ShipCanvas';
import { CrewSprite, CREW_DATA, CrewMemberData } from '../components/CrewSprite';

const LOG_MESSAGES = [
  "🍳 Sanji crafted a cold email prompt — Score 28/30",
  "⚔️ Zoro sharpened a code debugging prompt",
  "🗺️ Nami charted the route for market research",
  "🩺 Chopper quality check passed: 29/30 ✅",
  "📖 Robin loaded deep context for technical docs",
  "🏴‍☠️ Luffy found a new prompt idea on the horizon",
  "🎯 Usopp landed a perfect shot — SEO prompt done",
  "⚡ Prompt Engine sailing at full speed",
];

export function AgentsPage() {
  const [selectedMember, setSelectedMember] = useState<CrewMemberData | null>(null);
  const [logs, setLogs] = useState<string[]>([LOG_MESSAGES[0]]);
  const [logIndex, setLogIndex] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setLogs(prev => {
        const next = [...prev, LOG_MESSAGES[logIndex]];
        if (next.length > 3) next.shift();
        return next;
      });
      setLogIndex((logIndex + 1) % LOG_MESSAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [logIndex]);

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-[#020818] font-sans">
      {/* 1. THE MAIN SHIP SCENE */}
      <div className="absolute inset-0 z-0">
        <ShipCanvas>
          <div className="relative w-full h-full max-sm:scale-60 max-sm:origin-top">
            {CREW_DATA.map(member => (
              <CrewSprite 
                key={member.id} 
                member={member} 
                onClick={setSelectedMember} 
              />
            ))}
          </div>
        </ShipCanvas>
      </div>

      {/* 2. HUD OVERLAY: TOP CENTER */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 text-center pointer-events-none z-50 animate-fade-in-down">
        <h1 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase drop-shadow-[0_0_20px_rgba(139,92,246,0.5)]">
          ⛵ The Grand Line
        </h1>
        <p className="text-purple-400/80 text-[10px] md:text-xs uppercase font-black tracking-[0.5em] mt-3 drop-shadow-lg">
          Prompt Engine Crew — Sailing the AI Seas
        </p>
      </div>

      {/* 3. HUD OVERLAY: EXIT BUTTON */}
      <div className="absolute top-28 right-8 z-50">
        <NavLink 
          to="/" 
          className="bg-black/40 hover:bg-white text-white hover:text-black backdrop-blur-md px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all shadow-xl"
        >
          ✕ Exit
        </NavLink>
      </div>

      {/* 4. SHIP'S LOG PANEL: BOTTOM */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-black/70 backdrop-blur-2xl border-t border-purple-500/20 z-50 px-8 flex flex-col justify-center">
        <div className="max-w-4xl mx-auto w-full space-y-1">
          {logs.map((log, idx) => (
            <div 
              key={`${log}-${idx}`}
              className={`text-white/80 text-[11px] md:text-sm font-medium italic animate-slide-in-right opacity-${100 - (2 - idx) * 30}`}
              style={{ transitionDelay: `${idx * 100}ms` }}
            >
              &gt; {log}
            </div>
          ))}
        </div>
      </div>

      {/* 5. CHARACTER POPUP OVERLAY */}
      {selectedMember && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md z-[100] p-6 animate-fade-in"
          onClick={() => setSelectedMember(null)}
        >
          <div 
            className="w-full max-w-lg bg-[#0a0a14]/95 border border-purple-500/40 rounded-[2.5rem] p-10 shadow-[0_50px_120px_rgba(0,0,0,0.9)] relative animate-pop-in"
            style={{ borderTop: `10px solid ${selectedMember.id === 'luffy' ? '#ef4444' : selectedMember.id === 'zoro' ? '#22c55e' : '#a855f7'}` }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedMember(null)}
              className="absolute top-8 right-10 text-white/20 hover:text-white transition-colors text-2xl"
            >
              ✕
            </button>
            
            <div className="flex flex-col md:flex-row gap-10 items-center">
              {/* Larger Sprite Display */}
              <div className="w-48 h-48 overflow-hidden rounded-3xl bg-white/5 border border-white/5 flex items-center justify-center p-4">
                <div 
                  className={`character-sprite-${selectedMember.id}-lg`}
                  style={{
                    width: '256px',
                    height: '256px',
                    backgroundImage: `url('/sprites/${selectedMember.id}.png')`,
                    backgroundPosition: `0px -${selectedMember.yOffset}px`,
                    imageRendering: 'pixelated',
                    transform: 'scale(1)',
                    animation: `${selectedMember.id}-anim 0.8s steps(${selectedMember.frames}) infinite`
                  }}
                />
              </div>

              <div className="flex-1">
                <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-[0.3em] mb-2">{selectedMember.role}</h4>
                <h2 className="text-5xl font-black text-white italic tracking-tighter uppercase leading-none mb-4">{selectedMember.name}</h2>
                <p className="text-gray-400 text-sm leading-relaxed mb-6 italic">"{selectedMember.description}"</p>
                
                <div className="grid grid-cols-2 gap-4 mb-8 text-[11px] font-bold">
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <p className="text-gray-600 uppercase mb-1">Missions</p>
                    <p className="text-white">{Math.floor(Math.random() * 600) + 200}</p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <p className="text-gray-600 uppercase mb-1">Specialty</p>
                    <p className="text-purple-400 uppercase">{selectedMember.specialty}</p>
                  </div>
                </div>

                <NavLink 
                  to="/"
                  className="flex items-center justify-center gap-3 w-full bg-white text-black font-black py-5 rounded-2xl hover:scale-105 transition-all shadow-2xl group"
                >
                  SEND ON MISSION
                  <span className="text-2xl group-hover:translate-x-2 transition-transform">→</span>
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- ANIMATIONS --- */}
      <style>{`
        @keyframes fade-in-down {
          from { opacity: 0; transform: translate(-50%, -20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes pop-in {
          from { opacity: 0; transform: scale(0.9) translateY(40px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-fade-in-down { animation: fade-in-down 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-slide-in-right { animation: slide-in-right 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-pop-in { animation: pop-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}
