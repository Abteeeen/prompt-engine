import React from 'react';

interface Character {
  id: string;
  name: string;
  role: string;
  specialty: string;
}

export function CharacterPopup({ char, onClose }: { char: Character; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="relative w-[340px] bg-[#020414]/96 border border-violet-500/60 rounded-[20px] p-7 shadow-[0_0_60px_rgba(139,92,246,0.2),0_20px_60px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-300"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
        >
          ✕
        </button>

        <div className="flex flex-col items-center gap-6">
          {/* Animated Sprite Placeholder */}
          <div className="w-32 h-32 bg-violet-500/10 rounded-full flex items-center justify-center border border-violet-500/20">
             <div className="text-4xl">⚓</div>
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-bold text-white tracking-widest">{char.name}</h2>
            <p className="text-violet-400 font-medium mt-1">{char.role}</p>
          </div>

          <div className="w-full space-y-3">
            <div className="flex items-center gap-3 text-white/80">
              <span className="text-lg">⚡</span>
              <p><span className="text-white/40">Specialty:</span> {char.specialty}</p>
            </div>
            <div className="flex items-center gap-3 text-white/80">
              <span className="text-lg">🎯</span>
              <p><span className="text-white/40">Missions:</span> {Math.floor(Math.random() * 900) + 100}</p>
            </div>
            <div className="flex items-center gap-3 text-white/80">
              <span className="text-lg">✅</span>
              <p><span className="text-white/40">Status:</span> Ready</p>
            </div>
          </div>

          <button className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-violet-600/20">
            Send on Mission →
          </button>
        </div>
      </div>
    </div>
  );
}
