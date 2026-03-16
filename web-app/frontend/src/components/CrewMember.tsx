import React, { useState } from 'react';

export interface CrewAgent {
  id: string;
  name: string;
  spriteUrl: string;
  role: string;
  task: string;
  status: string;
  doneText: string;
  color: string;
  position: { top: string; left: string };
  specialty: string;
  animationClass: string;
}

export const CREW: CrewAgent[] = [
  {
    id: 'luffy',
    name: 'Luffy',
    spriteUrl: '/images/agents/luffy.png',
    role: 'The Idea Agent',
    task: 'Turning raw ideas into structured concepts',
    status: 'Exploring...',
    doneText: 'Idea found!',
    color: '#ef4444',
    position: { top: '32%', left: '88%' },
    specialty: 'Strategy & Brainstorming',
    animationClass: 'animate-sway'
  },
  {
    id: 'nami',
    name: 'Nami',
    spriteUrl: '/images/agents/nami.png',
    role: 'The Research Agent',
    task: 'Mapping out knowledge and research context',
    status: 'Mapping...',
    doneText: 'Route charted!',
    color: '#f97316',
    position: { top: '42%', left: '58%' },
    specialty: 'Data & Market Research',
    animationClass: 'animate-bob'
  },
  {
    id: 'zoro',
    name: 'Zoro',
    spriteUrl: '/images/agents/zoro.png',
    role: 'The Optimizer Agent',
    task: 'Sharpening prompts for maximum precision',
    status: 'Training...',
    doneText: 'Prompt sharpened!',
    color: '#22c55e',
    position: { top: '55%', left: '42%' },
    specialty: 'Code & Logic Optimization',
    animationClass: 'animate-pulse-slow'
  },
  {
    id: 'sanji',
    name: 'Sanji',
    spriteUrl: '/images/agents/sanji.png',
    role: 'The Writer Agent',
    task: 'Crafting final copy with perfect flavor',
    status: 'Cooking...',
    doneText: 'Prompt served!',
    color: '#eab308',
    position: { top: '52%', left: '26%' },
    specialty: 'Creative & Email Writing',
    animationClass: 'animate-sway'
  },
  {
    id: 'chopper',
    name: 'Chopper',
    spriteUrl: '/images/agents/chopper.png',
    role: 'The Quality Agent',
    task: 'Diagnosing quality and verifying score',
    status: 'Diagnosing...',
    doneText: 'Quality verified!',
    color: '#ec4899',
    position: { top: '55%', left: '16%' },
    specialty: 'Review & Proofreading',
    animationClass: 'animate-bob'
  },
  {
    id: 'robin',
    name: 'Robin',
    spriteUrl: '/images/agents/robin.png',
    role: 'The Context Agent',
    task: 'Loading deep domain expertise and context',
    status: 'Reading...',
    doneText: 'Context loaded!',
    color: '#a855f7',
    position: { top: '72%', left: '48%' },
    specialty: 'Legal & Academic Context',
    animationClass: 'animate-pulse-slow'
  }
];

interface CrewMemberProps {
  agent: CrewAgent;
  isActive: boolean;
}

export function CrewMember({ agent, isActive }: CrewMemberProps) {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <div 
      className="absolute z-30 transition-all duration-500"
      style={{ 
        top: agent.position.top, 
        left: agent.position.left,
        transform: 'translate(-50%, -50%)'
      }}
    >
      <div 
        className="relative cursor-pointer group"
        onClick={() => setShowPopup(!showPopup)}
      >
        {/* Animated Aura when active */}
        {isActive && (
          <div className="absolute inset-0 scale-[2.5] bg-opacity-30 rounded-full animate-ping z-0" style={{ backgroundColor: agent.color }} />
        )}
        
        {/* Character Sprite */}
        <div 
          className={`relative z-10 w-12 h-12 md:w-16 md:h-16 transition-all duration-300 transform 
            ${isActive ? 'scale-125' : 'group-hover:scale-110'} ${agent.animationClass}`}
          style={{ 
            filter: isActive ? `drop-shadow(0 0 10px ${agent.color}) brightness(1.2)` : 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))',
          }}
        >
          <img 
            src={agent.spriteUrl} 
            alt={agent.name} 
            className="w-full h-full object-contain pixel-art" 
          />
        </div>

        {/* Status Badge */}
        <div 
          className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 rounded-lg text-[10px] font-black text-white border transition-all duration-300 opacity-0 group-hover:opacity-100 z-20"
          style={{ 
            backgroundColor: 'rgba(15, 15, 20, 0.9)', 
            borderColor: agent.color,
            backdropFilter: 'blur(8px)',
            boxShadow: `0 0 15px ${agent.color}44`
          }}
        >
          {isActive ? (
            <span className="flex items-center gap-1">
              <span className="w-1 h-1 rounded-full animate-pulse" style={{ backgroundColor: agent.color }} />
              {agent.status}
            </span>
          ) : agent.name}
        </div>

        {/* Popup Detail */}
        {showPopup && (
          <div 
            className="absolute bottom-16 left-1/2 -translate-x-1/2 w-56 bg-[#0f0f14]/95 border border-white/10 backdrop-blur-2xl rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 animate-slide-up"
            style={{ borderTop: `4px solid ${agent.color}` }}
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-xs font-black text-white uppercase tracking-tighter">{agent.role}</h4>
              <button onClick={(e) => { e.stopPropagation(); setShowPopup(false); }} className="text-white/40 hover:text-white">×</button>
            </div>
            <p className="text-[10px] text-gray-400 leading-tight mb-2 italic">"{agent.task}"</p>
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[9px]">
                <span className="text-white/40">Specialty:</span>
                <span style={{ color: agent.color }}>{agent.specialty}</span>
              </div>
              <div className="flex justify-between items-center text-[9px]">
                <span className="text-white/40">Status:</span>
                <span className="text-emerald-400">Ready</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <style>{`
        @keyframes bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes sway {
          0%, 100% { transform: rotate(-3deg) translateY(0); }
          50% { transform: rotate(3deg) translateY(-4px); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        .animate-bob { animation: bob 3s ease-in-out infinite; }
        .animate-sway { animation: sway 4s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 5s ease-in-out infinite; }
        
        .pixel-art {
          image-rendering: pixelated;
          image-rendering: -moz-crisp-edges;
          image-rendering: crisp-edges;
        }

        @keyframes slide-up {
          from { transform: translate(-50%, 20px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
