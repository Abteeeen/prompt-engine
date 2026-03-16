import React, { useRef, useEffect, useState, useMemo } from 'react';
import { NavLink } from 'react-router-dom';

// --- Types & Constants ---
interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  color: string;
  status: 'active' | 'working' | 'idle';
  statusColor: string;
  // Hitbox for canvas interaction (relative to ship center)
  hitbox: { x: number; y: number; width: number; height: number };
}

const AGENTS: Agent[] = [
  { id: 'luffy', name: 'Luffy', role: 'The Idea Agent', description: 'Finds groundbreaking concepts and raw prompt ideas.', color: '#ef4444', status: 'active', statusColor: '#22c55e', hitbox: { x: 80, y: -40, width: 40, height: 60 } },
  { id: 'zoro', name: 'Zoro', role: 'The Optimizer Agent', description: 'Sharpens prompts for maximum precision and efficiency.', color: '#22c55e', status: 'working', statusColor: '#eab308', hitbox: { x: -60, y: 10, width: 40, height: 60 } },
  { id: 'sanji', name: 'Sanji', role: 'The Writer Agent', description: 'Crafts final copy with perfect creative flavor.', color: '#eab308', status: 'idle', statusColor: '#a855f7', hitbox: { x: 40, y: 10, width: 40, height: 60 } },
  { id: 'nami', name: 'Nami', role: 'The Research Agent', description: 'Charts the best routes for data and market research.', color: '#f97316', status: 'active', statusColor: '#22c55e', hitbox: { x: -20, y: -60, width: 40, height: 60 } },
  { id: 'chopper', name: 'Chopper', role: 'The Quality Agent', description: 'Diagnoses prompt health and verifies final scores.', color: '#ec4899', status: 'working', statusColor: '#eab308', hitbox: { x: -100, y: 30, width: 30, height: 40 } },
  { id: 'robin', name: 'Robin', role: 'The Context Agent', description: 'Loads deep domain knowledge and historical context.', color: '#a855f7', status: 'idle', statusColor: '#a855f7', hitbox: { x: 10, y: 50, width: 30, height: 30 } },
];

const LOG_MESSAGES = [
  "Sanji crafted a cold email prompt — Score 28/30 ✅",
  "Nami charted route for market research 🗺️",
  "Zoro sharpened a code review prompt ⚔️",
  "Chopper verified quality: 29/30 🩺",
  "Robin loaded context for technical writing 📖",
  "Luffy found a new prompt idea 🏴‍☠️",
];

export function AgentsPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [currentLogIndex, setCurrentLogIndex] = useState(0);

  // --- Ship & Wave Animation State ---
  useEffect(() => {
    const logInterval = setInterval(() => {
      setCurrentLogIndex(prev => (prev + 1) % LOG_MESSAGES.length);
    }, 3000);
    return () => clearInterval(logInterval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    // Stars data
    const stars = Array.from({ length: 80 }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 1.5 + 0.5,
      twinkle: Math.random() > 0.75,
      offset: Math.random() * Math.PI * 2
    }));

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const draw = () => {
      time += 0.016;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // --- LAYER 1: SKY ---
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, '#020818');
      skyGrad.addColorStop(1, '#0a1628');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // Stars
      stars.forEach(s => {
        ctx.fillStyle = '#ffffff';
        let alpha = 0.5;
        if (s.twinkle) {
          alpha = 0.3 + Math.sin(time * 2 + s.offset) * 0.4;
        }
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(s.x * w, s.y * h * 0.7, s.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // Moon
      ctx.shadowBlur = 40;
      ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(w * 0.85, h * 0.15, 40, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // --- LAYER 2: DISTANT OCEAN ---
      ctx.fillStyle = '#0d2137';
      ctx.fillRect(0, h * 0.65, w, h * 0.35);
      
      // Horizon Waves
      ctx.beginPath();
      ctx.moveTo(0, h * 0.65);
      for (let x = 0; x <= w; x += 20) {
        ctx.lineTo(x, h * 0.65 + Math.sin(x * 0.01 + time * 0.5) * 5);
      }
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.fill();

      // --- LAYER 3: MAIN OCEAN WAVES ---
      const drawWave = (color: string, speed: number, wavelength: number, amplitude: number, offset: number, hasFoam: boolean = false) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        const yBase = h * 0.75 + offset;
        ctx.moveTo(0, yBase);
        for (let x = 0; x <= w; x += 10) {
          const waveY = yBase + Math.sin(x * wavelength + time * speed) * amplitude;
          ctx.lineTo(x, waveY);
          if (hasFoam && Math.sin(x * wavelength + time * speed) > 0.8) {
             // Subtle foam tops
             ctx.fillStyle = 'white';
             ctx.globalAlpha = 0.1;
             ctx.beginPath();
             ctx.arc(x, waveY, 5, 0, Math.PI * 2);
             ctx.fill();
             ctx.fillStyle = color;
             ctx.globalAlpha = 1;
          }
        }
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.fill();
      };

      drawWave('#0d3b5e', 0.4, 0.005, 10, 20); // Wave 1
      drawWave('#0e4a73', 0.6, 0.008, 15, 50); // Wave 2
      drawWave('#0f5a8a', 0.8, 0.01, 20, 80);  // Wave 3
      drawWave('#1a6fa8', 1.2, 0.015, 25, 120, true); // Wave 4 (Front)

      // --- LAYER 4: THE SHIP ---
      const shipX = w / 2;
      const shipY = h * 0.75 + 60 + Math.sin(time * 0.8) * 3;
      const shipRotation = Math.sin(time * 0.5) * 0.02;

      ctx.save();
      ctx.translate(shipX, shipY);
      ctx.rotate(shipRotation);

      // Hull
      ctx.fillStyle = '#3d2a1d'; // Dark wood
      ctx.beginPath();
      ctx.moveTo(-120, 0);
      ctx.lineTo(120, 0);
      ctx.lineTo(100, 60);
      ctx.lineTo(-100, 60);
      ctx.closePath();
      ctx.fill();

      // Main Mast
      ctx.fillStyle = '#2a1b12';
      ctx.fillRect(-6, -180, 12, 180);

      // Sails
      ctx.fillStyle = '#fdfcf0'; // Cream
      ctx.beginPath();
      ctx.moveTo(0, -170);
      ctx.quadraticCurveTo(-80, -100, -10, -30);
      ctx.lineTo(0, -30);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(0, -170);
      ctx.quadraticCurveTo(80, -100, 10, -30);
      ctx.lineTo(0, -30);
      ctx.fill();

      // Lion Figurehead
      ctx.fillStyle = '#facc15'; // Gold
      ctx.beginPath();
      ctx.arc(120, -10, 15, 0, Math.PI * 2); // Head
      ctx.fill();
      // Mane lines
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 2;
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(120 + Math.cos(angle) * 15, -10 + Math.sin(angle) * 15);
        ctx.lineTo(120 + Math.cos(angle) * 22, -10 + Math.sin(angle) * 22);
        ctx.stroke();
      }

      // Crow's Nest
      ctx.fillStyle = '#2a1b12';
      ctx.beginPath();
      ctx.arc(0, -185, 12, 0, Math.PI);
      ctx.fill();

      // Portholes
      ctx.fillStyle = '#fde047';
      ctx.globalAlpha = 0.6 + Math.sin(time * 2) * 0.2;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#facc15';
      ctx.beginPath();
      ctx.arc(-60, 30, 6, 0, Math.PI * 2);
      ctx.arc(0, 30, 6, 0, Math.PI * 2);
      ctx.arc(60, 30, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;

      // Flag
      ctx.fillStyle = 'black';
      ctx.fillRect(-30, -210, 30, 20);
      ctx.fillStyle = 'white';
      ctx.fillRect(-22, -202, 4, 4); // Jolly roger hint

      // --- LAYER 5: CREW MEMBERS ---
      const drawCharacter = (agent: Agent) => {
        const { x, y } = agent.hitbox;
        ctx.save();
        ctx.translate(x, y);

        // Name Label
        ctx.fillStyle = 'white';
        ctx.font = 'bold 10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(agent.name, 0, -35);

        // Status Indicator
        ctx.fillStyle = agent.statusColor;
        ctx.beginPath();
        ctx.arc(15, -38, 3, 0, Math.PI * 2);
        ctx.fill();

        // Chibi Shape
        ctx.fillStyle = agent.color;
        
        // Custom Animations
        let bodyY = 0;
        let armX = 15;
        let armY = -15;

        if (agent.id === 'luffy') {
          // Rubber stretch arm
          armX = 15 + Math.abs(Math.sin(time * 1.5)) * 30;
          ctx.strokeStyle = 'white';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(5, -15);
          ctx.lineTo(armX, -15);
          ctx.stroke();
          // Straw hat
          ctx.fillStyle = '#b45309';
          ctx.beginPath();
          ctx.arc(0, -30, 10, Math.PI, 0);
          ctx.fill();
          ctx.fillStyle = agent.color;
        }

        if (agent.id === 'zoro') {
          // Sword swing
          const angle = Math.sin(time * 4) * 0.8;
          ctx.save();
          ctx.translate(10, -15);
          ctx.rotate(angle);
          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(0, -30, 4, 30);
          ctx.restore();
          // Green hair
          ctx.fillStyle = '#22c55e';
          ctx.beginPath();
          ctx.arc(0, -25, 10, Math.PI, 0);
          ctx.fill();
          ctx.fillStyle = 'white'; // shirt
        }

        if (agent.id === 'sanji') {
          // Stirring motion
          const stirX = Math.cos(time * 10) * 5;
          const stirY = Math.sin(time * 10) * 5;
          ctx.fillStyle = '#334155';
          ctx.fillRect(-5 + stirX, -10 + stirY, 20, 4); // Hand/Spoon
          // Flame
          ctx.fillStyle = '#f97316';
          ctx.globalAlpha = 0.5 + Math.random() * 0.5;
          ctx.beginPath();
          ctx.moveTo(-5, 5);
          ctx.lineTo(5, 5);
          ctx.lineTo(0, 15);
          ctx.fill();
          ctx.globalAlpha = 1;
        }

        if (agent.id === 'chopper') {
          // Bouncing
          bodyY = Math.abs(Math.sin(time * 5)) * -10;
        }

        if (agent.id === 'nami') {
          // Pointing
          armX = Math.sin(time * 2) > 0 ? 20 : -20;
          ctx.fillStyle = 'white';
          ctx.fillRect(armX > 0 ? 5 : -15, -15, 10, 3);
        }

        if (agent.id === 'robin') {
          // Reading in porthole (Robin is below deck)
          ctx.restore(); // Exit character translate early to respect window
          return; 
        }

        // Base Chibi Body
        ctx.fillStyle = agent.color === 'white' ? '#f4f4f5' : agent.color;
        ctx.fillRect(-8, -20 + bodyY, 16, 20); // Body
        ctx.fillStyle = '#fde68a'; // Face
        ctx.beginPath();
        ctx.arc(0, -25 + bodyY, 10, 0, Math.PI * 2); // Head
        ctx.fill();

        ctx.restore();
      };

      AGENTS.forEach(drawCharacter);

      ctx.restore(); // End Ship Save

      animationId = requestAnimationFrame(draw);
    };

    draw();

    // --- Interaction Logic ---
    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Adjust mouse coords for ship position and rotation
      const shipX = canvas.width / 2;
      const shipY = canvas.height * 0.75 + 60 + Math.sin(time * 0.8) * 3;
      const localX = mouseX - shipX;
      const localY = mouseY - shipY;
      
      // Rough inverse rotation check (since rotation is small, skip complex affine math for performance)
      let found = false;
      AGENTS.forEach(agent => {
        const h = agent.hitbox;
        if (localX >= h.x - 20 && localX <= h.x + h.width + 20 &&
            localY >= h.y - 20 && localY <= h.y + h.height + 20) {
          setSelectedAgent(agent);
          found = true;
        }
      });
      if (!found) setSelectedAgent(null);
    };

    canvas.addEventListener('click', handleClick);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <div className="relative w-screen h-screen bg-[#02040a] overflow-hidden">
      {/* --- CANVAS ENGINE --- */}
      <canvas 
        ref={canvasRef} 
        className="w-full h-full block cursor-crosshair"
      />

      {/* --- HUD OVERLAY: TOP CENTER --- */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 text-center pointer-events-none z-50">
        <h1 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter uppercase leading-tight drop-shadow-2xl">
          ⚡ Prompt Engine — <span className="text-purple-500">The Straw Hat Crew</span>
        </h1>
        <p className="text-white/40 text-[10px] uppercase font-black tracking-[0.4em] mt-2">
          Sailing the Grand Line of AI
        </p>
      </div>

      {/* --- HUD OVERLAY: SHIP'S LOG --- */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl z-50 pointer-events-none">
        <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl overflow-hidden">
          <div className="flex items-center gap-3 mb-2 opacity-50">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
            <span className="text-[10px] font-black text-white tracking-widest uppercase">Live Ship's Log</span>
          </div>
          <div className="h-6 transition-all duration-500 transform translate-y-0">
            <p className="text-white font-medium text-sm italic tracking-tight animate-fade-in-out">
              &gt; {LOG_MESSAGES[currentLogIndex]}
            </p>
          </div>
        </div>
      </div>

      {/* --- UI: EXIT BUTTON --- */}
      <div className="absolute top-24 right-8 z-50">
        <NavLink 
          to="/" 
          className="bg-white/10 hover:bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-white text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all flex items-center gap-2"
        >
          ✕ Exit
        </NavLink>
      </div>

      {/* --- INFO PANEL OVERLAY --- */}
      {selectedAgent && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 p-6 animate-fade-in">
          <div 
            className="w-full max-w-md bg-[#0a0a0f]/95 border border-purple-500/30 backdrop-blur-3xl rounded-[2.5rem] p-8 shadow-[0_40px_100px_rgba(0,0,0,0.8)] relative animate-scale-up"
            style={{ borderTop: `8px solid ${selectedAgent.color}` }}
          >
            <button 
              onClick={() => setSelectedAgent(null)}
              className="absolute top-6 right-8 text-white/20 hover:text-white transition-colors text-lg"
            >
              ✕
            </button>
            <div className="mb-6">
              <h4 className="text-xs font-black text-purple-400 uppercase tracking-widest mb-1">{selectedAgent.role}</h4>
              <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">{selectedAgent.name}</h2>
            </div>
            <div className="space-y-6">
              <p className="text-gray-300 text-sm leading-relaxed italic">
                "{selectedAgent.description}"
              </p>
              <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: selectedAgent.statusColor }} />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Status: Ready for missions</span>
              </div>
              <NavLink 
                to="/"
                className="flex items-center justify-center gap-3 w-full bg-white text-black font-black py-4 rounded-2xl hover:scale-[1.02] transition-transform shadow-xl"
              >
                SEND ON MISSION
                <span className="text-lg">→</span>
              </NavLink>
            </div>
          </div>
        </div>
      )}

      {/* --- CANVAS KEYFRAMES --- */}
      <style>{`
        @keyframes fade-in-out {
          0% { opacity: 0; transform: translateY(10px); }
          20% { opacity: 1; transform: translateY(0); }
          80% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-10px); }
        }
        .animate-fade-in-out {
          animation: fade-in-out 3s infinite ease-in-out;
        }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
        .animate-scale-up { animation: scaleUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleUp { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }

        .pixel-art {
          image-rendering: pixelated;
        }
      `}</style>
    </div>
  );
}
