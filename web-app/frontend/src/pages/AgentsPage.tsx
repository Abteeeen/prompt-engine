import React, { useState, useEffect } from 'react';
import { ShipScene } from '../components/ShipScene';
import { CREW, CrewMember } from '../components/CrewMember';
import { ShipLog } from '../components/ShipLog';
import { api } from '../services/api';

export function AgentsPage() {
  const [totalPrompts, setTotalPrompts] = useState(1284);
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null);

  // Randomly "activate" agents to make it feel alive
  useEffect(() => {
    const interval = setInterval(() => {
      const randomAgent = CREW[Math.floor(Math.random() * CREW.length)];
      setActiveAgentId(randomAgent.id);
      setTimeout(() => setActiveAgentId(null), 3000);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 min-h-screen">
      {/* Header / Status Bar */}
      <div className="mb-12 text-center relative">
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-10 blur-2xl pointer-events-none">
          <div className="w-96 h-96 bg-purple-600 rounded-full" />
        </div>
        
        <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tighter uppercase italic">
          Grand Line <span className="text-purple-500">Expedition</span>
        </h1>
        <p className="text-gray-400 text-sm max-w-2xl mx-auto mb-10 leading-relaxed">
          Your AI Crew is navigating the sea of creativity. Each straw hat agent specializes in a unique 
          segment of the prompt engineering pipeline.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#0a0a0f]/80 backdrop-blur-xl p-6 rounded-[2rem] border border-white/5 max-w-4xl mx-auto shadow-2xl">
          <div className="text-center px-4 border-r border-white/5">
            <p className="text-[10px] uppercase font-black text-white/30 tracking-[0.2em] mb-2">Ocean</p>
            <p className="text-sm font-black text-blue-400 uppercase">New World</p>
          </div>
          <div className="text-center px-4 md:border-r border-white/5">
            <p className="text-[10px] uppercase font-black text-white/30 tracking-[0.2em] mb-2">Weather</p>
            <p className="text-sm font-black text-yellow-500 uppercase">Clear Skies</p>
          </div>
          <div className="text-center px-4 border-r border-white/5">
            <p className="text-[10px] uppercase font-black text-white/30 tracking-[0.2em] mb-2">Missions</p>
            <p className="text-sm font-black text-white">{totalPrompts.toLocaleString()}</p>
          </div>
          <div className="text-center px-4">
            <p className="text-[10px] uppercase font-black text-white/30 tracking-[0.2em] mb-2">Heading</p>
            <p className="text-sm font-black text-purple-400 uppercase italic">Better Prompts</p>
          </div>
        </div>
      </div>

      {/* The Main Scene */}
      <ShipScene>
        {CREW.map(agent => (
          <CrewMember 
            key={agent.id} 
            agent={agent} 
            isActive={activeAgentId === agent.id} 
          />
        ))}
      </ShipScene>

      {/* The Activity Log */}
      <ShipLog />

      {/* Bottom CTA */}
      <div className="mt-16 text-center animate-fade-in">
        <a 
          href="/"
          className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white text-black font-black text-sm shadow-2xl hover:scale-105 active:scale-95 transition-all group"
        >
          Send the crew a mission
          <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </a>
        <p className="mt-4 text-[11px] text-gray-500 uppercase tracking-widest font-bold">Return to Generator</p>
      </div>
    </div>
  );
}
