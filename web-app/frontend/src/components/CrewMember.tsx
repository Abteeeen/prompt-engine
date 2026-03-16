import React, { useState } from 'react';

export interface CrewAgent {
  id: string;
  name: string;
  character: string;
  role: string;
  task: string;
  status: string;
  doneText: string;
  color: string;
  position: { top: string; left: string };
  specialty: string;
}

export const CREW: CrewAgent[] = [
  {
    id: 'luffy',
    name: 'Luffy',
    character: '🏴‍☠️',
    role: 'The Idea Agent',
    task: 'Turning raw ideas into structured concepts',
    status: 'Exploring...',
    doneText: 'Idea found!',
    color: '#ef4444',
    position: { top: '35%', left: '82%' },
    specialty: 'Strategy & Brainstorming'
  },
  {
    id: 'nami',
    name: 'Nami',
    character: '🗺️',
    role: 'The Research Agent',
    task: 'Mapping out knowledge and research context',
    status: 'Mapping...',
    doneText: 'Route charted!',
    color: '#f97316',
    position: { top: '45%', left: '55%' },
    specialty: 'Data & Market Research'
  },
  {
    id: 'zoro',
    name: 'Zoro',
    character: '⚔️',
    role: 'The Optimizer Agent',
    task: 'Sharpening prompts for maximum precision',
    status: 'Training...',
    doneText: 'Prompt sharpened!',
    color: '#22c55e',
    position: { top: '58%', left: '40%' },
    specialty: 'Code & Logic Optimization'
  },
  {
    id: 'sanji',
    name: 'Sanji',
    character: '🍳',
    role: 'The Writer Agent',
    task: 'Crafting final copy with perfect flavor',
    status: 'Cooking...',
    doneText: 'Prompt served!',
    color: '#eab308',
    position: { top: '55%', left: '25%' },
    specialty: 'Creative & Email Writing'
  },
  {
    id: 'chopper',
    name: 'Chopper',
    character: '🩺',
    role: 'The Quality Agent',
    task: 'Diagnosing quality and verifying score',
    status: 'Diagnosing...',
    doneText: 'Quality verified!',
    color: '#ec4899',
    position: { top: '55%', left: '15%' },
    specialty: 'Review & Proofreading'
  },
  {
    id: 'robin',
    name: 'Robin',
    character: '📖',
    role: 'The Context Agent',
    task: 'Loading deep domain expertise and context',
    status: 'Reading...',
    doneText: 'Context loaded!',
    color: '#a855f7',
    position: { top: '75%', left: '45%' },
    specialty: 'Legal & Academic Context'
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
          <div className="absolute inset-0 scale-[2.5] bg-opacity-20 rounded-full animate-ping" style={{ backgroundColor: agent.color }} />
        )}
        
        {/* Character Avatar */}
        <div 
          className={`text-3xl md:text-4xl transition-all duration-300 transform 
            ${isActive ? 'scale-125 glow-active' : 'group-hover:scale-110 animate-float'}`}
          style={{ 
            filter: isActive ? `drop-shadow(0 0 10px ${agent.color})` : 'none',
            animationDelay: `${Math.random() * 2}s`
          }}
        >
          {agent.character}
        </div>

        {/* Status Badge */}
        <div 
          className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-full text-[9px] font-bold text-white border transition-all duration-300 opacity-0 group-hover:opacity-100"
          style={{ 
            backgroundColor: 'rgba(0,0,0,0.6)', 
            borderColor: agent.color,
            backdropFilter: 'blur(4px)'
          }}
        >
          {isActive ? agent.status : agent.name}
        </div>

        {/* Popup Detail */}
        {showPopup && (
          <div 
            className="absolute bottom-12 left-1/2 -translate-x-1/2 w-48 bg-black/90 border border-white/10 backdrop-blur-xl rounded-xl p-3 shadow-2xl z-50 animate-slide-up"
            style={{ borderLeft: `4px solid ${agent.color}` }}
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
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .glow-active {
          animation: glow 1.5s ease-in-out infinite alternate;
        }
        @keyframes glow {
          from { filter: drop-shadow(0 0 5px currentColor); }
          to { filter: drop-shadow(0 0 15px currentColor); }
        }
        @keyframes slide-up {
          from { transform: translate(-50%, 10px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
