import React from 'react';

export function ShipScene({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full h-full overflow-hidden bg-[#02040a]">
      {/* Background Layer: Deep Night Sky */}
      <div className="absolute inset-0 z-0">
        {[...Array(80)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-white animate-twinkle"
            style={{
              width: Math.random() * 2 + 'px',
              height: Math.random() * 2 + 'px',
              top: Math.random() * 80 + '%',
              left: Math.random() * 100 + '%',
              animationDelay: Math.random() * 5 + 's',
              opacity: Math.random() * 0.8
            }}
          />
        ))}
        {/* Massive Glowing Moon */}
        <div className="absolute top-20 right-[15%] w-40 h-40 rounded-full bg-white/5 blur-xl shadow-[0_0_120px_rgba(255,255,255,0.2)] animate-pulse" />
      </div>

      {/* Midground: Parallax Clouds */}
      <div className="absolute inset-0 z-1 pointer-events-none">
        <div className="absolute top-[20%] left-[-10%] w-[120%] h-32 bg-gradient-to-r from-transparent via-blue-900/10 to-transparent blur-3xl animate-drift-slow" />
        <div className="absolute top-[45%] left-[-10%] w-[120%] h-24 bg-gradient-to-r from-transparent via-purple-900/5 to-transparent blur-3xl animate-drift-reverse" />
      </div>

      {/* THE OCEAN: 3D-Feeling Moving Water Layers */}
      <div className="absolute inset-0 z-2 overflow-hidden pointer-events-none">
        {/* Layer 1: Far Ocean (Static Background) */}
        <div className="absolute bottom-0 w-full h-[60%] bg-gradient-to-t from-[#02040a] to-[#0a1a3a]/40" />
        
        {/* Layer 2: Deep Waves (Slowest) */}
        <div className="absolute bottom-0 w-full h-full z-10 opacity-30">
          <svg className="w-full h-full" viewBox="0 24 150 28" preserveAspectRatio="none">
            <use href="#wave-pattern" x="48" y="0" fill="#0a1a3a" className="animate-wave-slowest" />
          </svg>
        </div>

        {/* Layer 3: Secondary Waves */}
        <div className="absolute bottom-[-10px] w-full h-full z-20 opacity-50">
          <svg className="w-full h-full" viewBox="0 24 150 28" preserveAspectRatio="none">
            <use href="#wave-pattern" x="48" y="3" fill="#081430" className="animate-wave-slower" />
          </svg>
        </div>
      </div>

      {/* THE SHIP: Thousand Sunny Isometric Focus */}
      <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[450px] md:w-[850px] aspect-[1.6/1] z-30 animate-rock-immersive">
        {/* Reflection below ship */}
        <div className="absolute top-[85%] left-1/2 -translate-x-1/2 w-[80%] h-12 bg-blue-500/10 blur-2xl rounded-full" />
        
        <img 
          src="/images/agents/ship_base.png" 
          alt="Thousand Sunny" 
          className="w-full h-full object-contain drop-shadow-[0_40px_100px_rgba(0,0,0,1)] pixel-art relative z-10"
        />
        
        {/* Ambient Ship Detail: News Coo */}
        <div className="absolute top-[18%] left-[24%] w-10 h-10 z-20 animate-bob-ship">
          <img src="/images/agents/news_coo.png" alt="News Coo" className="w-full h-full object-contain pixel-art opacity-90 filter drop-shadow(0 0 10px white)" />
        </div>

        {/* Global Ship Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-blue-900/20 mix-blend-overlay pointer-events-none rounded-full blur-3xl" />

        {/* This is where CrewMembers are positioned */}
        <div className="absolute inset-0 z-40 pointer-events-auto">
          {children}
        </div>
      </div>

      {/* Foreground Waves: Immersive Front Layer */}
      <div className="absolute bottom-0 w-full z-50 h-[40%] pointer-events-none">
        <svg className="w-full h-full" viewBox="0 24 150 28" preserveAspectRatio="none">
          <defs>
            <path id="wave-pattern" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
          </defs>
          <g className="parallax-waves">
            <use href="#wave-pattern" x="48" y="0" fill="rgba(2, 4, 10, 0.8)" className="animate-wave-fast" />
            <use href="#wave-pattern" x="48" y="5" fill="rgba(8, 14, 30, 0.6)" className="animate-wave-medium" />
            <use href="#wave-pattern" x="48" y="10" fill="#02040a" className="animate-wave-vfast" />
          </g>
        </svg>
      </div>

      <style>{`
        .pixel-art { image-rendering: pixelated; }

        @keyframes drift-slow {
          from { transform: translateX(-100%) scale(1.5); }
          to { transform: translateX(100%) scale(1.5); }
        }
        @keyframes drift-reverse {
          from { transform: translateX(100%) scale(2); }
          to { transform: translateX(-100%) scale(2); }
        }
        .animate-drift-slow { animation: drift-slow 80s linear infinite; }
        .animate-drift-reverse { animation: drift-reverse 60s linear infinite; }

        @keyframes rock-immersive {
          0% { transform: translate(-50%, -50%) rotate(-2deg) translateY(0); }
          50% { transform: translate(-50%, -50%) rotate(2deg) translateY(-20px); }
          100% { transform: translate(-50%, -50%) rotate(-2deg) translateY(0); }
        }
        .animate-rock-immersive { animation: rock-immersive 8s infinite ease-in-out; }

        @keyframes bob-ship {
          0%, 100% { transform: translateY(0) rotate(-5deg); }
          50% { transform: translateY(-8px) rotate(5deg); }
        }
        .animate-bob-ship { animation: bob-ship 4s ease-in-out infinite; }

        .animate-wave-slowest { animation: move-wave 25s linear infinite; }
        .animate-wave-slower { animation: move-wave 20s linear infinite; }
        .animate-wave-medium { animation: move-wave 15s linear infinite; }
        .animate-wave-fast { animation: move-wave 12s linear infinite; }
        .animate-wave-vfast { animation: move-wave 10s linear infinite; }

        @keyframes move-wave {
          0% { transform: translate3d(-90px,0,0); }
          100% { transform: translate3d(85px,0,0); }
        }

        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.3); }
        }
        .animate-twinkle { animation: twinkle 5s infinite ease-in-out; }
      `}</style>
    </div>
  );
}
