import React, { useRef, useEffect } from 'react';

const WAVES = [
  { fillColor: '#0a2540', amplitude: 8, frequency: 0.008, speed: 0.003, phaseOffset: 0 },
  { fillColor: '#0d3358', amplitude: 12, frequency: 0.009, speed: 0.005, phaseOffset: 1.2 },
  { fillColor: '#0f4070', amplitude: 18, frequency: 0.010, speed: 0.007, phaseOffset: 2.4 },
  { fillColor: '#1a5490', amplitude: 22, frequency: 0.011, speed: 0.009, phaseOffset: 0.8 },
  { fillColor: '#1e6ab0', amplitude: 28, frequency: 0.012, speed: 0.012, phaseOffset: 1.8, foam: true },
];

export function ShipCanvas({ children }: { children: React.ReactNode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const stars = Array.from({ length: 60 }, () => ({
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

      // 1. SKY
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, '#020818');
      skyGrad.addColorStop(1, '#071428');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      stars.forEach(s => {
        ctx.fillStyle = 'white';
        ctx.globalAlpha = s.twinkle ? 0.3 + Math.sin(time * 2 + s.offset) * 0.4 : 0.6;
        ctx.beginPath();
        ctx.arc(s.x * w, s.y * h * 0.6, s.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // Moon
      ctx.shadowBlur = 40;
      ctx.shadowColor = 'white';
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(w * 0.85, h * 0.15, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // 2. OCEAN WAVES
      const waveBaseY = h * 0.72;
      WAVES.forEach((layer, idx) => {
        ctx.beginPath();
        ctx.moveTo(0, h);
        for (let x = 0; x <= w; x += 4) {
          const y = waveBaseY + Math.sin(x * layer.frequency + time * layer.speed * 60 + layer.phaseOffset) * layer.amplitude;
          ctx.lineTo(x, y);
          
          if (layer.foam && idx === 4 && Math.sin(x * layer.frequency + time * layer.speed * 60 + layer.phaseOffset) > 0.9) {
            ctx.fillStyle = 'white';
            ctx.globalAlpha = 0.2;
            ctx.beginPath();
            ctx.arc(x, y - 2, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = layer.fillColor;
            ctx.globalAlpha = 1;
          }
        }
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fillStyle = layer.fillColor;
        ctx.fill();
      });

      // 3. SKETCHFAB-ACCURATE THOUSAND SUNNY CALCULATIONS
      const shipBaseY = waveBaseY + Math.sin(time * 0.4) * 8; // More pronounced bobbing
      const shipRotation = Math.sin(time * 0.3) * 0.02;
      
      document.documentElement.style.setProperty('--ship-y', `${Math.sin(time * 0.4) * 8}px`);

      ctx.save();
      ctx.translate(w / 2, shipBaseY + 80);
      ctx.rotate(shipRotation);

      // --- HULL BASE (2:1 Proportions: Light Wood 2/3, Red Band 1/3) ---
      // Lower Wood Section (2/3) - Now clearly the majority
      ctx.fillStyle = '#b6895d'; // Light Wood
      ctx.beginPath();
      ctx.moveTo(-280, -10);
      ctx.lineTo(280, -10);
      ctx.lineTo(220, 110);
      ctx.lineTo(-220, 110);
      ctx.closePath();
      ctx.fill();
      
      // Plank grains
      ctx.strokeStyle = '#8d6e63';
      ctx.lineWidth = 0.5;
      for (let i = -260; i < 260; i += 25) {
        ctx.beginPath();
        ctx.moveTo(i, -10);
        ctx.lineTo(i * 0.85, 105);
        ctx.stroke();
      }

      // Upper Red Band (1/3) - Sitting on top
      ctx.fillStyle = '#e11d48'; // Vibrant Red
      ctx.beginPath();
      ctx.moveTo(-300, -50);
      ctx.lineTo(300, -50);
      ctx.lineTo(280, -10);
      ctx.lineTo(-280, -10);
      ctx.closePath();
      ctx.fill();

      // Top White Rim
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-305, -55, 610, 8);

      // --- SOLDIER DOCK SYSTEM (Exactly Two, White Rimmed) ---
      const drawDock = (x: number, num: string) => {
        ctx.save();
        ctx.fillStyle = '#ffffff'; // White rim
        ctx.beginPath(); ctx.arc(x, 25, 30, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#2a1205'; // Inner door
        ctx.beginPath(); ctx.arc(x, 25, 24, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#d4a017';
        ctx.font = 'bold 18px Inter, Arial';
        ctx.textAlign = 'center';
        ctx.fillText(num, x, 32);
        ctx.restore();
      };
      drawDock(-120, '1');
      drawDock(120, '2');

      // --- LAWN DECK (Green Grass + White Picket Fence) ---
      ctx.fillStyle = '#22c55e'; // Vibrant Grass
      ctx.fillRect(-220, -65, 440, 15);
      // White Picket Fence (Individual pickets)
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      for (let i = -215; i < 215; i += 12) {
        ctx.beginPath(); ctx.moveTo(i, -65); ctx.lineTo(i, -85); ctx.stroke();
      }
      ctx.beginPath(); ctx.moveTo(-215, -75); ctx.lineTo(215, -75); ctx.stroke();

      // --- CABINS (Multi-tiered Red Roofs) ---
      // Forward Kitchen (Two-tier roof)
      ctx.fillStyle = '#fdfcf0';
      ctx.fillRect(50, -115, 100, 70);
      ctx.fillStyle = '#e11d48';
      // Tier 1
      ctx.beginPath();
      ctx.moveTo(40, -115); ctx.lineTo(160, -115); ctx.lineTo(150, -135); ctx.lineTo(50, -135);
      ctx.closePath(); ctx.fill();
      // Tier 2
      ctx.beginPath();
      ctx.moveTo(70, -135); ctx.lineTo(130, -135); ctx.lineTo(120, -150); ctx.lineTo(80, -150);
      ctx.closePath(); ctx.fill();

      // Rear Library Tower (Stern)
      ctx.fillStyle = '#fdfcf0';
      ctx.fillRect(-180, -100, 110, 70);
      // Balcony
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-185, -105, 120, 5);
      // Dome Roof
      ctx.fillStyle = '#e11d48';
      ctx.beginPath();
      ctx.arc(-125, -100, 55, Math.PI, 0);
      ctx.fill();

      // --- FIGUREHEAD (Thousand Sunny Lion) ---
      const fX = 320; const fY = -40;
      // Sunflower Mane (Refined Bezier)
      ctx.fillStyle = '#facc15';
      for (let i = 0; i < 18; i++) {
        const a = (i / 18) * Math.PI * 2;
        ctx.save();
        ctx.translate(fX, fY); ctx.rotate(a);
        ctx.beginPath(); ctx.moveTo(0, 0);
        ctx.bezierCurveTo(20, -25, 40, -25, 55, 0);
        ctx.bezierCurveTo(40, 25, 20, 25, 0, 0);
        ctx.fill(); ctx.restore();
      }
      // Face
      ctx.fillStyle = '#facc15';
      ctx.beginPath(); ctx.arc(fX, fY, 40, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#92400e'; ctx.lineWidth = 2; ctx.stroke();
      // Features
      ctx.fillStyle = '#000';
      ctx.beginPath(); ctx.arc(fX - 12, fY - 10, 6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(fX + 12, fY - 10, 6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(fX, fY + 14, 10, 0, Math.PI); ctx.stroke(); // Smile

      // --- MASTS & RIGGING ---
      ctx.strokeStyle = '#2d1a10';
      ctx.lineWidth = 2;
      // Rigging ropes
      ctx.beginPath();
      ctx.moveTo(-10, -360); ctx.lineTo(240, -30);
      ctx.moveTo(-10, -360); ctx.lineTo(-240, -30);
      ctx.stroke();

      // Masts
      ctx.fillStyle = '#4d2a1a';
      ctx.fillRect(-12, -400, 24, 350); // Main mast
      ctx.fillRect(-140, -250, 15, 200); // Fore mast

      // Crow's Nests (Beach Ball: Yellow/Red)
      const drawNests = (mx: number, my: number) => {
        ctx.save();
        ctx.translate(mx, my);
        ctx.fillStyle = '#facc15';
        ctx.beginPath(); ctx.arc(0, 0, 25, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#e11d48';
        for(let i=0; i<4; i++) {
          ctx.beginPath(); ctx.moveTo(0,0); ctx.arc(0,0, 25, (i/4)*Math.PI*2, (i/4)*Math.PI*2 + Math.PI/4); ctx.fill();
        }
        ctx.restore();
      };
      drawNests(0, -400); 
      drawNests(-132, -250);

      // --- SAILS ---
      ctx.save();
      const sW = Math.sin(time * 0.6) * 10;
      ctx.fillStyle = '#fefce8';
      // Main Sail
      ctx.beginPath();
      ctx.moveTo(-180, -380);
      ctx.quadraticCurveTo(0, -405 + sW, 180, -380);
      ctx.quadraticCurveTo(150 + sW, -220, 20, -70);
      ctx.lineTo(-20, -70);
      ctx.quadraticCurveTo(-150 - sW, -220, -180, -380);
      ctx.fill();
      
      // JOLLY ROGER (Manual Vectoring)
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 80px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('☠️', 0, -220); // Placeholder emoji for context
      // Red sash
      ctx.fillStyle = '#e11d48';
      ctx.fillRect(-45, -280, 90, 8);
      ctx.restore();

      // --- GLOWING PORTHOLES ---
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#fbbf24';
      const pG = 0.4 + Math.sin(time * 1.5) * 0.4;
      ctx.fillStyle = `rgba(251, 191, 36, ${pG})`;
      [-200, -80, 80, 200].forEach(p => {
        ctx.beginPath(); ctx.arc(p, -10, 14, 0, Math.PI * 2); ctx.fill();
      });
      ctx.shadowBlur = 0;

      ctx.restore();

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="relative w-full h-full bg-[#020818] overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 block" />
      <div className="relative z-10 w-full h-full pointer-events-none">
        <div className="pointer-events-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
