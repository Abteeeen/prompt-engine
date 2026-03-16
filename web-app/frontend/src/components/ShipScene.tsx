import React from 'react';

export function ShipScene({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden rounded-3xl bg-[#030612] shadow-2xl border border-white/5">
      {/* Night Sky with Twinkling Stars */}
      <div className="absolute inset-0 z-0">
        {[...Array(50)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-white animate-twinkle"
            style={{
              width: Math.random() * 2 + 'px',
              height: Math.random() * 2 + 'px',
              top: Math.random() * 70 + '%',
              left: Math.random() * 100 + '%',
              animationDelay: Math.random() * 5 + 's',
              opacity: Math.random()
            }}
          />
        ))}
        {/* Large Moon */}
        <div className="absolute top-12 right-12 w-20 h-20 rounded-full bg-white/10 blur-sm shadow-[0_0_60px_rgba(255,255,255,0.1)]" />
      </div>

      {/* Distant Islands */}
      <div className="absolute bottom-32 w-full flex justify-around opacity-20 pointer-events-none">
        <div className="w-64 h-32 bg-black rounded-[100%_100%_0_0] blur-md translate-y-12" />
        <div className="w-48 h-20 bg-black rounded-[100%_100%_0_0] blur-md translate-y-8" />
      </div>

      {/* The Ocean Waves (SVG) */}
      <div className="absolute bottom-0 w-full z-10">
        <svg className="waves" xmlns="http://www.w3.org/2000/svg" viewBox="0 24 150 28" preserveAspectRatio="none" shapeRendering="auto">
          <defs>
            <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
          </defs>
          <g className="parallax">
            <use href="#gentle-wave" x="48" y="0" fill="rgba(8, 14, 44, 0.7)" />
            <use href="#gentle-wave" x="48" y="3" fill="rgba(8, 14, 44, 0.5)" />
            <use href="#gentle-wave" x="48" y="5" fill="rgba(8, 14, 44, 0.3)" />
            <use href="#gentle-wave" x="48" y="7" fill="#030612" />
          </g>
        </svg>
      </div>

      {/* Thousand Sunny Ship silhouette/container */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[350px] md:w-[500px] h-[300px] z-20 animate-rock">
        {/* Main Hull Shape (SVG) */}
        <svg className="w-full h-full drop-shadow-2xl" viewBox="0 0 500 300" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Sunny Figurehead base */}
          <circle cx="430" cy="120" r="30" fill="#1e1e1e" />
          <path d="M430 90 L460 120 L430 150 L400 120 Z" fill="#FFA500" opacity="0.4" />
          
          {/* Ship Body */}
          <path d="M50 80 L80 220 L420 220 L400 100 Z" fill="#2a1b12" />
          <path d="M50 80 C 150 60, 300 60, 400 100" stroke="#3d2a1d" strokeWidth="4" />
          
          {/* Main Mast */}
          <rect x="220" y="20" width="12" height="180" fill="#3d2a1d" />
          <path d="M120 40 L340 40 L320 130 L140 130 Z" fill="white" opacity="0.05" />
          
          {/* Windows (Glow) */}
          <rect x="150" y="160" width="15" height="15" rx="2" fill="#eab308" opacity="0.3" className="animate-pulse" />
          <rect x="250" y="160" width="15" height="15" rx="2" fill="#eab308" opacity="0.3" className="animate-pulse" />
          <rect x="350" y="160" width="15" height="15" rx="2" fill="#eab308" opacity="0.3" className="animate-pulse" />
        </svg>

        {/* This is where CrewMembers will be absolute-positioned */}
        {children}
      </div>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; transform: scale(1.2); }
        }
        .animate-twinkle {
          animation: twinkle 4s infinite ease-in-out;
        }
        @keyframes rock {
          0% { transform: translate(-50%, 0) rotate(-1deg); }
          50% { transform: translate(-50%, -5px) rotate(1deg); }
          100% { transform: translate(-50%, 0) rotate(-1deg); }
        }
        .animate-rock {
          animation: rock 5s infinite ease-in-out;
        }

        .waves {
          position: relative;
          width: 100%;
          height: 100px;
          margin-bottom:-7px; /*Fix for safari gap*/
          min-height:100px;
          max-height:150px;
        }

        .parallax > use {
          animation: move-forever 25s cubic-bezier(.55,.5,.45,.5) infinite;
        }
        .parallax > use:nth-child(1) {
          animation-delay: -2s;
          animation-duration: 7s;
        }
        .parallax > use:nth-child(2) {
          animation-delay: -3s;
          animation-duration: 10s;
        }
        .parallax > use:nth-child(3) {
          animation-delay: -4s;
          animation-duration: 13s;
        }
        .parallax > use:nth-child(4) {
          animation-delay: -5s;
          animation-duration: 20s;
        }
        @keyframes move-forever {
          0% { transform: translate3d(-90px,0,0); }
          100% { transform: translate3d(85px,0,0); }
        }
      `}</style>
    </div>
  );
}
