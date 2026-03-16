import React from 'react';

export function ShipScene({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full h-[500px] md:h-[650px] overflow-hidden rounded-[3rem] bg-[#02040a] shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/5 group">
      {/* Background Layer: Night Sky */}
      <div className="absolute inset-0 z-0">
        {[...Array(60)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-white animate-twinkle"
            style={{
              width: Math.random() * 2 + 'px',
              height: Math.random() * 2 + 'px',
              top: Math.random() * 60 + '%',
              left: Math.random() * 100 + '%',
              animationDelay: Math.random() * 5 + 's',
              opacity: Math.random() * 0.7
            }}
          />
        ))}
        {/* Large Glowing Moon */}
        <div className="absolute top-16 right-20 w-24 h-24 rounded-full bg-white/5 blur-md shadow-[0_0_80px_rgba(255,255,255,0.15)] animate-pulse" />
      </div>

      {/* Midground: Slow Moving Stylized Clouds */}
      <div className="absolute inset-0 z-1 pointer-events-none opacity-20">
        <div className="absolute top-20 left-1/4 w-96 h-20 bg-gradient-to-r from-transparent via-white/20 to-transparent blur-3xl animate-drift-slow" />
        <div className="absolute top-40 right-1/4 w-80 h-16 bg-gradient-to-r from-transparent via-white/10 to-transparent blur-3xl animate-drift-reverse" />
      </div>

      {/* Far Background Waves */}
      <div className="absolute bottom-20 w-[200%] left-[-50%] h-40 opacity-40 z-2">
        <svg className="w-full h-full" viewBox="0 24 150 28" preserveAspectRatio="none">
          <use href="#wave-path-static" x="48" y="0" fill="rgba(10, 20, 50, 0.4)" />
        </svg>
      </div>

      {/* THE SHIP: Thousand Sunny Isometric Image */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-[380px] md:w-[650px] aspect-[1.6/1] z-10 animate-rock">
        <img 
          src="/images/agents/ship_base.png" 
          alt="Thousand Sunny" 
          className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.9)] pixel-art"
        />
        
        {/* Ambient Ship Detail: News Coo */}
        <div className="absolute top-[15%] left-[25%] w-8 h-8 z-20 animate-bob-ship">
          <img src="/images/agents/news_coo.png" alt="News Coo" className="w-full h-full object-contain pixel-art opacity-80" />
        </div>

        {/* This is where CrewMembers are positioned */}
        {children}
      </div>

      {/* Foreground Waves: Depth Layers */}
      <div className="absolute bottom-0 w-full z-40 h-32 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 24 150 28" preserveAspectRatio="none">
          <defs>
            <path id="wave-path-static" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
          </defs>
          <g className="parallax-waves">
            <use href="#wave-path-static" x="48" y="0" fill="rgba(2, 4, 10, 0.8)" />
            <use href="#wave-path-static" x="48" y="3" fill="rgba(8, 14, 30, 0.5)" />
            <use href="#wave-path-static" x="48" y="7" fill="#02040a" />
          </g>
        </svg>
      </div>

      <style>{`
        .pixel-art { image-rendering: pixelated; }

        @keyframes drift-slow {
          from { transform: translateX(-100%); }
          to { transform: translateX(100%); }
        }
        @keyframes drift-reverse {
          from { transform: translateX(100%); }
          to { transform: translateX(-100%); }
        }
        .animate-drift-slow { animation: drift-slow 60s linear infinite; }
        .animate-drift-reverse { animation: drift-reverse 45s linear infinite; }

        @keyframes rock {
          0% { transform: translate(-50%, 0) rotate(-1.5deg); }
          50% { transform: translate(-50%, -12px) rotate(1.5deg); }
          100% { transform: translate(-50%, 0) rotate(-1.5deg); }
        }
        .animate-rock { animation: rock 6s infinite ease-in-out; }

        @keyframes bob-ship {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bob-ship { animation: bob-ship 3s ease-in-out infinite; }

        .parallax-waves > use {
          animation: move-wave 20s cubic-bezier(.55,.5,.45,.5) infinite;
        }
        .parallax-waves > use:nth-child(1) { animation-delay: -2s; animation-duration: 7s; }
        .parallax-waves > use:nth-child(2) { animation-delay: -3s; animation-duration: 10s; }
        .parallax-waves > use:nth-child(3) { animation-delay: -5s; animation-duration: 15s; }

        @keyframes move-wave {
          0% { transform: translate3d(-90px,0,0); }
          100% { transform: translate3d(85px,0,0); }
        }

        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        .animate-twinkle { animation: twinkle 4s infinite ease-in-out; }
      `}</style>
    </div>
  );
}
