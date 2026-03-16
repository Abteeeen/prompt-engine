import React, { useState, useEffect } from 'react';
import { ShipScene } from '../components/ShipScene';
import { CrewMember, CREW } from '../components/CrewMember';
import { ShipLog } from '../components/ShipLog';

export function AgentsPage() {
  const [totalPrompts, setTotalPrompts] = useState(1284);
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null);

  useEffect(() => {
    // Simulate real-time prompt generation updates
    const interval = setInterval(() => {
      setTotalPrompts(prev => prev + Math.floor(Math.random() * 2));
    }, 5000);

    // Randomly activate an agent to simulate work
    const agentInterval = setInterval(() => {
      const randomAgent = CREW[Math.floor(Math.random() * CREW.length)].id;
      setActiveAgentId(randomAgent);
      setTimeout(() => setActiveAgentId(null), 3000);
    }, 8000);

    return () => {
      clearInterval(interval);
      clearInterval(agentInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-[#02040a]">
      {/* FULL SCREEN SHIP SCENE */}
      <div className="absolute inset-0 z-0 scale-110">
        <ShipScene>
          {CREW.map(agent => (
            <CrewMember 
              key={agent.id} 
              agent={agent} 
              isActive={activeAgentId === agent.id} 
            />
          ))}
        </ShipScene>
      </div>

      {/* DASHBOARD OVERLAYS */}
      
      {/* Top Left: Expedition Status */}
      <div className="absolute top-24 left-6 md:left-12 z-50 pointer-events-none">
        <div className="bg-[#0a0a0f]/80 backdrop-blur-2xl p-6 rounded-[2.5rem] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] animate-slide-right">
          <div className="mb-4">
            <h1 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter uppercase leading-none mb-2">
              Grand Line <span className="text-purple-500">Expedition</span>
            </h1>
            <div className="flex items-center gap-3">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] uppercase font-black text-white/40 tracking-[0.2em]">Ship Status: Battle Ready</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-2xl p-3 border border-white/5 pointer-events-auto">
              <p className="text-[9px] uppercase font-bold text-purple-400 mb-1">Total Missions</p>
              <p className="text-xl font-black text-white leading-none">{totalPrompts.toLocaleString()}</p>
            </div>
            <div className="bg-white/5 rounded-2xl p-3 border border-white/5 pointer-events-auto">
              <p className="text-[9px] uppercase font-bold text-blue-400 mb-1">Sea Route</p>
              <p className="text-xl font-black text-white leading-none uppercase italic">New World</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Left: Live Ship Log */}
      <div className="absolute bottom-10 left-6 md:left-12 z-50 hidden md:block animate-slide-up">
        <div className="w-80 h-48 overflow-hidden pointer-events-auto">
          <ShipLog />
        </div>
      </div>

      {/* Right Side: Crew Info Badge */}
      <div className="absolute top-24 right-6 md:right-12 z-50 pointer-events-none text-right animate-slide-left">
        <div className="bg-[#0a0a0f]/60 backdrop-blur-xl px-6 py-4 rounded-3xl border border-white/10 shadow-2xl">
          <p className="text-[10px] uppercase font-black text-white/30 tracking-[0.3em] mb-1">Active Agents</p>
          <div className="flex justify-end -space-x-3">
            {CREW.map(member => (
              <div 
                key={member.id}
                className={`w-10 h-10 rounded-full border-2 border-[#0a0a0f] overflow-hidden transition-all duration-300 ${activeAgentId === member.id ? 'scale-125 z-10 border-purple-500' : 'z-0 opacity-60'}`}
              >
                <img src={member.spriteUrl} alt={member.name} className="w-full h-full object-cover pixel-art" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-right {
          from { transform: translateX(-50px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slide-left {
          from { transform: translateX(50px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slide-up {
          from { transform: translateY(50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-right { animation: slide-right 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-slide-left { animation: slide-left 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-slide-up { animation: slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        
        .pixel-art {
          image-rendering: pixelated;
        }
      `}</style>
    </div>
  );
}
