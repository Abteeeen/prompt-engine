import React from 'react';

interface WantedPosterProps {
  name: string;
  bounty: string;
  image?: string;
  isMission?: boolean;
}

export function WantedPoster({ name, bounty, image, isMission = true }: WantedPosterProps) {
  return (
    <div className="relative w-full aspect-[2/3] bg-[#f4e4bc] rounded-sm p-[5%] shadow-2xl border-2 border-[#5d4037]/20 overflow-hidden flex flex-col group transition-all duration-500 hover:-translate-y-2 hover:shadow-orange-900/40">
      {/* Parchment Texture Overlay */}
      <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/old-map.png')]" />
      
      {/* Header */}
      <div className="text-center mb-[5%] pt-[2%]">
        <h3 className="text-[1.8em] font-black text-[#5d4037] leading-none tracking-tighter uppercase font-serif">WANTED</h3>
        <p className="text-[0.5em] text-[#5d4037]/60 font-black uppercase tracking-widest mt-0.5">DEAD OR ALIVE</p>
      </div>

      {/* Image Area */}
      <div className="relative flex-1 bg-[#dcc6a0] border-[3px] border-[#5d4037]/80 flex items-center justify-center overflow-hidden">
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover filter sepia-[0.3] contrast-[1.1]" />
        ) : (
          <div className="text-[#5d4037]/10 text-6xl">☠️</div>
        )}
        
        {/* "ON A MISSION" Stamp */}
        {isMission && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 w-[120%] py-1 bg-red-800/90 text-white text-center font-black text-[0.85em] uppercase border-y-2 border-white/20 whitespace-nowrap shadow-xl z-10 animate-in fade-in zoom-in duration-700">
            ON A MISSION
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="text-center pt-[5%] pb-[2%]">
        <h4 className="text-[1.4em] font-black text-[#5d4037] uppercase overflow-hidden whitespace-nowrap text-ellipsis tracking-tight">
          {name}
        </h4>
        <div className="mt-1 border-t border-[#5d4037]/20 pt-1 flex flex-col items-center">
          <p className="text-[#5d4037]/60 text-[0.45em] uppercase font-bold tracking-widest mb-0.5">Bounty</p>
          <div className="flex items-center gap-1">
             <span className="text-[#5d4037] text-[1em] font-black">฿ {bounty}</span>
          </div>
        </div>
      </div>

      {/* Rough Edges Effect */}
      <div className="absolute inset-0 border-[10px] border-transparent shadow-[inset_0_0_20px_rgba(93,64,55,0.15)] pointer-events-none" />
    </div>
  );
}
