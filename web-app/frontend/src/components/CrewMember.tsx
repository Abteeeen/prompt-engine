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
  actionClass: string;
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
    position: { top: '30%', left: '88%' },
    specialty: 'Strategy & Brainstorming',
    actionClass: 'animate-luffy-flex'
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
    actionClass: 'animate-nami-nav'
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
    actionClass: 'animate-zoro-weights'
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
    actionClass: 'animate-sanji-cook'
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
    position: { top: '56%', left: '16%' },
    specialty: 'Review & Proofreading',
    actionClass: 'animate-chopper-hop'
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
    position: { top: '74%', left: '48%' },
    specialty: 'Legal & Academic Context',
    actionClass: 'animate-robin-focus'
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
      className="absolute z-30 transition-all duration-1000"
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
        {/* ACTION AURA */}
        <div 
          className={`absolute inset-0 scale-[3] bg-opacity-20 rounded-full blur-2xl transition-all duration-500 opacity-0 ${isActive ? 'opacity-100 animate-pulse' : 'group-hover:opacity-40'}`} 
          style={{ backgroundColor: agent.color }} 
        />
        
        {/* CHARACTER SPRITE WITH DYNAMIC ACTIONS */}
        <div 
          className={`relative z-10 w-16 h-16 md:w-24 md:h-24 transition-all duration-500 transform ${agent.actionClass} ${isActive ? 'brightness(1.3) scale-110' : ''}`}
          style={{ 
            filter: isActive ? `drop-shadow(0 0 15px ${agent.color}88)` : 'drop-shadow(0 8px 12px rgba(0,0,0,0.6))',
          }}
        >
          <img 
            src={agent.spriteUrl} 
            alt={agent.name} 
            className="w-full h-full object-contain pixel-art" 
          />
          
          {/* SPECIAL ACTION FX */}
          {agent.id === 'sanji' && isActive && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-8 bg-blue-500/40 rounded-full blur-xl animate-pulse" />
          )}
          {agent.id === 'luffy' && isActive && (
            <div className="absolute inset-0 border-2 border-white/20 rounded-full animate-ping" />
          )}
        </div>

        {/* Status Indicator */}
        <div 
          className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap px-4 py-2 rounded-xl text-[11px] font-black text-white border transition-all duration-500 opacity-0 group-hover:opacity-100 z-20 pointer-events-none"
          style={{ 
            backgroundColor: 'rgba(5, 5, 10, 0.95)', 
            borderColor: agent.color,
            backdropFilter: 'blur(12px)',
            boxShadow: `0 0 30px ${agent.color}33`
          }}
        >
          {isActive ? (
            <span className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: agent.color }} />
              WORKING: {agent.status}
            </span>
          ) : (
            <span className="flex items-center gap-2 uppercase tracking-widest">
              {agent.name} <span className="text-[8px] opacity-40">| VIEW DETAILS</span>
            </span>
          )}
        </div>

        {/* POPUP CARD (Inspired by floor796 character cards) */}
        {showPopup && (
          <div 
            className="absolute bottom-24 left-1/2 -translate-x-1/2 w-64 bg-[#0a0a0f]/95 border border-white/10 backdrop-blur-3xl rounded-[2rem] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.9)] z-50 animate-popup-in"
            style={{ borderTop: `6px solid ${agent.color}` }}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-xs font-black text-white/40 uppercase tracking-widest mb-1">{agent.role}</h4>
                <h2 className="text-2xl font-black text-white italic tracking-tighter leading-none">{agent.name}</h2>
              </div>
              <button onClick={(e) => { e.stopPropagation(); setShowPopup(false); }} className="text-white/20 hover:text-white transition-colors">✕</button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                <p className="text-[10px] text-purple-400 font-bold uppercase mb-2">Specialty</p>
                <p className="text-xs text-white font-medium leading-relaxed">{agent.specialty}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase mb-2">Current Mission</p>
                <p className="text-xs text-gray-300 italic">"{agent.task}"</p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <style>{`
        @keyframes zoro-weights {
          0%, 100% { transform: translateY(0) scaleY(1); }
          50% { transform: translateY(-12px) scaleY(0.95); }
        }
        @keyframes sanji-cook {
          0%, 100% { transform: scale(1) rotate(-1deg); }
          25% { transform: scale(1.02, 0.98) rotate(1deg); }
          50% { transform: scale(1) rotate(-1deg); }
          75% { transform: scale(0.98, 1.02) rotate(1deg); }
        }
        @keyframes luffy-flex {
          0%, 100% { transform: scale(1); filter: brightness(1); }
          50% { transform: scale(1.08); filter: brightness(1.4) drop-shadow(0 0 15px #ef444466); }
        }
        @keyframes chopper-hop {
          0%, 100% { transform: translateY(0); }
          20% { transform: translateY(-15px) rotate(5deg); }
          40% { transform: translateY(0); }
        }
        @keyframes nami-nav {
          0%, 100% { transform: translateX(0) scale(1); }
          50% { transform: translateX(5px) scale(1.02); }
        }
        @keyframes robin-focus {
          0%, 100% { transform: translateY(0); opacity: 0.9; }
          50% { transform: translateY(-4px); opacity: 1; }
        }

        .animate-zoro-weights { animation: zoro-weights 1.5s ease-in-out infinite; }
        .animate-sanji-cook { animation: sanji-cook 0.8s ease-in-out infinite; }
        .animate-luffy-flex { animation: luffy-flex 2s cubic-bezier(0.16, 1, 0.3, 1) infinite; }
        .animate-chopper-hop { animation: chopper-hop 4s ease-in-out infinite; }
        .animate-nami-nav { animation: nami-nav 3s ease-in-out infinite; }
        .animate-robin-focus { animation: robin-focus 4s ease-in-out infinite; }

        .pixel-art { image-rendering: pixelated; }

        @keyframes popup-in {
          from { transform: translate(-50%, 30px); opacity: 0; filter: blur(10px); }
          to { transform: translate(-50%, 0); opacity: 1; filter: blur(0); }
        }
        .animate-popup-in { animation: popup-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
}
