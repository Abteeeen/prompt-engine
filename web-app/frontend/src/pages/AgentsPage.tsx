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
      <div className="mb-12 text-center">
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 tracking-tight">The Straw Hat Prompt Crew</h1>
        <p className="text-gray-400 text-sm max-w-2xl mx-auto mb-8">
          Currently sailing the Grand Line of AI. Our specialized agents are distributed across the ship, 
          working together to transform your ideas into gold-standard outputs.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 bg-white/5 py-4 px-8 rounded-3xl border border-white/5 backdrop-blur-md">
          <div className="text-center">
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Crew Status</p>
            <p className="text-sm font-black text-emerald-400">Battle Ready 🏴‍☠️</p>
          </div>
          <div className="w-px h-8 bg-white/10 hidden sm:block" />
          <div className="text-center">
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Sea Conditions</p>
            <p className="text-sm font-black text-blue-400">Calm Waters</p>
          </div>
          <div className="w-px h-8 bg-white/10 hidden sm:block" />
          <div className="text-center">
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Total Prompts</p>
            <p className="text-sm font-black text-white">{totalPrompts.toLocaleString()}</p>
          </div>
          <div className="w-px h-8 bg-white/10 hidden sm:block" />
          <div className="text-center">
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Next Island</p>
            <p className="text-sm font-black text-purple-400">Better Outputs — 42nm</p>
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
