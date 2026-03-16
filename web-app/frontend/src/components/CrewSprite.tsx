import React, { useState } from 'react';

export interface CrewMemberData {
  id: string;
  name: string;
  role: string;
  description: string;
  specialty: string;
  frameWidth: number;
  frameHeight: number;
  totalWidth: number; // Width of one full animation row (frames * width)
  yOffset: number;
  frames: number;
  left: string;
  bottom: string;
  scale?: number;
}

export const CREW_DATA: CrewMemberData[] = [
  {
    id: 'luffy',
    name: 'Luffy',
    role: 'The Idea Agent',
    description: 'Finds groundbreaking concepts and raw prompt ideas.',
    specialty: 'Creative Strategy',
    frameWidth: 256,
    frameHeight: 256,
    totalWidth: 1536,
    yOffset: 1024,   // Row 5 (per subagent)
    frames: 6,
    left: 'calc(50% + 140px)',
    bottom: '220px', // Lowered slightly to sit on deck
    scale: 1.5
  },
  {
    id: 'zoro',
    name: 'Zoro',
    role: 'The Optimizer Agent',
    description: 'Sharpens prompts for maximum precision and efficiency.',
    specialty: 'Prompt Engineering',
    frameWidth: 256,
    frameHeight: 256,
    totalWidth: 1536,
    yOffset: 768,    // Row 4 (per subagent)
    frames: 6,
    left: 'calc(50% - 150px)',
    bottom: '225px',
    scale: 1.5
  },
  {
    id: 'sanji',
    name: 'Sanji',
    role: 'The Writer Agent',
    description: 'Crafts final copy with perfect creative flavor.',
    specialty: 'Copywriting',
    frameWidth: 256,
    frameHeight: 256,
    totalWidth: 1536,
    yOffset: 768,    // Row 4
    frames: 6,
    left: 'calc(50% + 60px)',
    bottom: '225px',
    scale: 1.5
  },
  {
    id: 'nami',
    name: 'Nami',
    role: 'The Research Agent',
    description: 'Charts the best routes for data and market research.',
    specialty: 'Market Analysis',
    frameWidth: 256,
    frameHeight: 256,
    totalWidth: 1536,
    yOffset: 1024,   // Row 5
    frames: 6,
    left: 'calc(50% - 15px)',
    bottom: '440px',
    scale: 1.3
  },
  {
    id: 'chopper',
    name: 'Chopper',
    role: 'The Quality Agent',
    description: 'Diagnoses prompt health and verifies final scores.',
    specialty: 'Quality Assurance',
    frameWidth: 256,
    frameHeight: 256,
    totalWidth: 1536,
    yOffset: 2560,   // Row 11
    frames: 6,
    left: 'calc(50% - 60px)',
    bottom: '225px',
    scale: 1.2
  },
  {
    id: 'usopp',
    name: 'Usopp',
    role: 'The Precision Agent',
    description: 'Land the perfect shot with SEO and targeting prompts.',
    specialty: 'SEO Optimization',
    frameWidth: 256,
    frameHeight: 256,
    totalWidth: 1536,
    yOffset: 768,    // Row 4
    frames: 6,
    left: 'calc(50% - 110px)',
    bottom: '225px',
    scale: 1.5
  },
  {
    id: 'robin',
    name: 'Robin',
    role: 'The Context Agent',
    description: 'Loads deep domain knowledge and historical context.',
    specialty: 'Research & Context',
    frameWidth: 256,
    frameHeight: 256,
    totalWidth: 1536,
    yOffset: 1024,   // Row 5
    frames: 6,
    left: 'calc(50% + 50px)', // Aligned with a porthole
    bottom: '165px',
  }
];

interface CrewSpriteProps {
  member: CrewMemberData;
  onClick: (member: CrewMemberData) => void;
}

export function CrewSprite({ member, onClick }: CrewSpriteProps) {
  const isRobin = member.id === 'robin';

  return (
    <div 
      className={`absolute cursor-pointer transition-all duration-300 hover:scale-125 hover:-translate-y-4 group z-50 ${isRobin ? 'rounded-full overflow-hidden' : ''}`}
      style={{
        left: member.left,
        bottom: member.bottom,
        transform: `translateY(var(--ship-y, 0))`,
        width: member.id === 'robin' ? '30px' : '100px', // Larger hit-box for verification
        height: member.id === 'robin' ? '30px' : '120px',
      }}
      onClick={() => onClick(member)}
    >
      <div 
        className={`character-sprite-${member.id}`}
        style={{
          width: '256px',
          height: '256px',
          backgroundImage: `url('/sprites/${member.id}.png')`,
          backgroundRepeat: 'no-repeat',
          imageRendering: 'pixelated',
          // @ts-ignore
          imageRendering: 'crisp-edges',
          animation: `${member.id}-anim 0.8s steps(${member.frames}) infinite`,
          transformOrigin: 'bottom center',
          // Simply center and scale, remove complex offsets for now
          marginLeft: '-78px',
          marginTop: '-136px',
          transform: isRobin ? 'scale(0.2) translate(-280px, -280px)' : `scale(${member.scale || 1})` 
        }}
      />
      
      {/* Name Label */}
      {!isRobin && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-black text-white px-2 py-0.5 bg-black/40 rounded-full backdrop-blur-sm pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
          {member.name}
        </div>
      )}

      <style>{`
        @keyframes ${member.id}-anim {
          from { background-position: 0px -${member.yOffset}px; }
          to { background-position: -${member.totalWidth}px -${member.yOffset}px; }
        }
      `}</style>
    </div>
  );
}
