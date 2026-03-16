import React, { useRef, useEffect } from 'react';
import { useAnimationFrame } from '../hooks/useAnimationFrame';

interface Wave {
  color: string;
  baseY: number;
  amp: number;
  freq: number;
  speed: number;
}

const WAVES: Wave[] = [
  { color: '#051525', baseY: 0.58, amp: 5, freq: 0.006, speed: 0.15 },
  { color: '#072035', baseY: 0.61, amp: 8, freq: 0.007, speed: 0.22 },
  { color: '#0a2f50', baseY: 0.64, amp: 12, freq: 0.008, speed: 0.30 },
  { color: '#0e3d68', baseY: 0.67, amp: 17, freq: 0.009, speed: 0.40 },
  { color: '#144d82', baseY: 0.71, amp: 23, freq: 0.010, speed: 0.52 },
  { color: '#1a5f9e', baseY: 0.75, amp: 30, freq: 0.011, speed: 0.68 },
];

export function OceanCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<any[]>([]);
  const offsetsRef = useRef<number[]>(new Array(6).fill(0));

  useEffect(() => {
    // Generate stars once
    starsRef.current = Array.from({ length: 100 }, () => ({
      x: Math.random(),
      y: Math.random() * 0.55,
      r: Math.random() * 1.5 + 0.3,
      twinkle: Math.random() > 0.8,
      phase: Math.random() * Math.PI * 2
    }));
  }, []);

  useAnimationFrame((t, dt) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const w = canvas.width = window.innerWidth;
    const h = canvas.height = window.innerHeight;

    // 1. SKY GRADIENT
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.65);
    skyGrad.addColorStop(0, '#000510');
    skyGrad.addColorStop(0.3, '#010d1f');
    skyGrad.addColorStop(0.6, '#020f28');
    skyGrad.addColorStop(1.0, '#041830');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. STARS
    starsRef.current.forEach((s) => {
      const opacity = s.twinkle
        ? 0.4 + Math.sin(t * 2.5 + s.phase) * 0.5
        : 0.8;
      ctx.beginPath();
      ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.fill();
    });

    // 3. MOON
    const moonX = w * 0.82;
    const moonY = h * 0.12;
    [60, 45, 30].forEach((blur, i) => {
      ctx.beginPath();
      ctx.arc(moonX, moonY, 38 + i * 4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(220, 230, 255, ${0.04 + i * 0.02})`;
      ctx.shadowBlur = blur;
      ctx.shadowColor = '#aaccff';
      ctx.fill();
    });
    ctx.beginPath();
    ctx.arc(moonX, moonY, 32, 0, Math.PI * 2);
    ctx.fillStyle = '#f0f4ff';
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#ffffff';
    ctx.fill();
    ctx.shadowBlur = 0;

    // 4. DISTANT HORIZON
    const horizonY = h * 0.60;
    const horGrad = ctx.createLinearGradient(0, horizonY - 20, 0, horizonY + 20);
    horGrad.addColorStop(0, '#041830');
    horGrad.addColorStop(1, '#062040');
    ctx.fillStyle = horGrad;
    ctx.fillRect(0, horizonY - 10, w, 20);

    // 5. WAVES
    WAVES.forEach((wave, i) => {
      offsetsRef.current[i] += wave.speed * dt * 60;
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let x = 0; x <= w + 4; x += 4) {
        const waveY = h * wave.baseY + 
          Math.sin(x * wave.freq + offsetsRef.current[i]) * wave.amp +
          Math.sin(x * wave.freq * 0.5 + offsetsRef.current[i] * 0.7) * wave.amp * 0.4;
        if (x === 0) ctx.moveTo(x, waveY);
        else ctx.lineTo(x, waveY);
        
        // FOAM on front wave
        if (i === WAVES.length - 1 && x % 80 === 0) {
          ctx.save();
          const foamOpacity = 0.3 + Math.sin(t * 3 + x) * 0.2;
          ctx.beginPath();
          ctx.arc(x, waveY, 4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${foamOpacity})`;
          ctx.fill();
          ctx.restore();
        }
      }
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fillStyle = wave.color;
      ctx.fill();
    });

    // 6. OCEAN SHIMMER
    for(let i=0; i<3; i++) {
        const shimmerX = w * (0.7 + Math.sin(t*0.2 + i)*0.1);
        const shimmerY = h * (0.7 + i*0.05);
        ctx.beginPath();
        ctx.ellipse(shimmerX, shimmerY, 150, 5, 0, 0, Math.PI*2);
        ctx.fillStyle = `rgba(150, 180, 255, ${0.03 + Math.sin(t*2+i)*0.02})`;
        ctx.fill();
    }
  });

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: '#000510' }}
    />
  );
}
