import React from 'react';

interface WantedPosterProps {
  name: string;
  bounty: string;
  image: string;
  isMission?: boolean;
  variant?: 'sidebar' | 'focus';
  onClick?: () => void;
}

export function WantedPoster({ name, bounty, image, isMission = true, variant = 'sidebar', onClick }: WantedPosterProps) {
  const isFocus = variant === 'focus';
  
  return (
    <div 
      onClick={onClick}
      className={`relative w-full aspect-[2/3] bg-[#f4e4bc] rounded-sm p-[6%] shadow-2xl border-2 border-[#5d4037]/20 overflow-hidden flex flex-col group transition-all duration-500 cursor-pointer ${
        isFocus ? 'scale-100' : 'hover:-translate-y-2 hover:shadow-orange-900/40'
      }`}
    >
      {/* High-Fidelity Parchment Texture */}
      <div className="absolute inset-0 opacity-[0.25] pointer-events-none mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/old-map.png')]" />
      <div className="absolute inset-0 opacity-[0.1] pointer-events-none mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
      
      {/* Header - Authentic Font Feel */}
      <div className="text-center mb-[4%] pt-[2%]">
        <h3 className={`font-black text-[#5d4037] leading-[0.8] tracking-tighter uppercase font-serif drop-shadow-sm ${isFocus ? 'text-[3.5em]' : 'text-[2.2em]'}`}>
          WANTED
        </h3>
        <p className={`text-[#5d4037]/70 font-black uppercase tracking-[0.2em] mt-1 ${isFocus ? 'text-[0.6em]' : 'text-[0.45em]'}`}>
          DEAD OR ALIVE
        </p>
      </div>

      {/* Main Illustration Area */}
      <div className="relative flex-1 bg-[#dcc6a0] border-[4px] border-[#5d4037]/90 flex items-center justify-center overflow-hidden shadow-inner">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover filter sepia-[0.4] contrast-[1.2] brightness-[0.9] transition-transform duration-700 group-hover:scale-105" 
        />
        
        {/* "ON A MISSION" Stamp */}
        {isMission && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 w-[130%] py-2 bg-red-900/90 text-white text-center font-black text-[1em] uppercase border-y-2 border-white/20 whitespace-nowrap shadow-2xl z-10 animate-in fade-in zoom-in duration-500">
            ON A MISSION
          </div>
        )}

        {/* Grain Overlay on Image */}
        <div className="absolute inset-0 opacity-[0.15] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      {/* Footer Info - Authentic Typography */}
      <div className="text-center pt-[5%] pb-[3%]">
        <h4 className={`font-black text-[#5d4037] uppercase overflow-hidden whitespace-nowrap text-ellipsis tracking-tight font-serif ${isFocus ? 'text-[2.2em]' : 'text-[1.6em]'}`}>
          {name}
        </h4>
        <div className="mt-1 border-t-[1.5px] border-[#5d4037]/20 pt-1.5 flex flex-col items-center">
          <p className="text-[#5d4037]/70 text-[0.45em] uppercase font-black tracking-[0.3em] mb-1">Bounty</p>
          <div className="flex items-center gap-1.5">
             <span className="text-[#5d4037] leading-none font-black flex items-center gap-1">
               <span className="text-[0.8em]">฿</span>
               <span className={`${isFocus ? 'text-[1.6em]' : 'text-[1.1em]'}`}>{bounty}-</span>
             </span>
          </div>
        </div>
      </div>

      {/* Rough Edges & Masking */}
      <div className="absolute inset-0 border-[12px] border-transparent shadow-[inset_0_0_30px_rgba(93,64,55,0.2)] pointer-events-none" />
      <div className="absolute inset-0 bg-orange-950/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
}
