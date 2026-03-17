import React, { useRef, useEffect } from 'react';
import { useAnimationFrame } from '../hooks/useAnimationFrame';

interface WaveConfig {
  baseY: number;
  amp: number;
  f: number;
  topColor: string;
  midColor: string;
  botColor: string;
  speed: number;
}

const WAVES: WaveConfig[] = [
  {
    baseY: 0.56, amp: 6, f: 0.005,
    topColor: 'rgba(8,20,40,0.9)',
    midColor: 'rgba(5,15,30,0.95)',
    botColor: 'rgba(2,8,18,1)',
    speed: 0.35
  },
  {
    baseY: 0.60, amp: 10, f: 0.007,
    topColor: 'rgba(10,28,55,0.92)',
    midColor: 'rgba(7,20,40,0.96)',
    botColor: 'rgba(3,10,22,1)',
    speed: 0.50
  },
  {
    baseY: 0.64, amp: 15, f: 0.008,
    topColor: 'rgba(14,36,70,0.93)',
    midColor: 'rgba(10,26,52,0.97)',
    botColor: 'rgba(4,13,28,1)',
    speed: 0.65
  },
  {
    baseY: 0.68, amp: 20, f: 0.009,
    topColor: 'rgba(18,48,90,0.94)',
    midColor: 'rgba(13,34,66,0.97)',
    botColor: 'rgba(6,18,38,1)',
    speed: 0.82
  },
  {
    baseY: 0.72, amp: 26, f: 0.010,
    topColor: 'rgba(22,58,108,0.95)',
    midColor: 'rgba(16,42,80,0.98)',
    botColor: 'rgba(8,22,46,1)',
    speed: 1.0
  },
  {
    baseY: 0.76, amp: 34, f: 0.011,
    topColor: 'rgba(26,70,128,0.96)',
    midColor: 'rgba(18,50,95,0.99)',
    botColor: 'rgba(10,26,54,1)',
    speed: 1.22
  },
];

export function OceanCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getWaveY = (x: number, wave: WaveConfig, t: number, H: number) => {
    // Standardized wave physics (time * speed matches getWaveHeight utility)
    const offset = t * wave.speed * 3; 
    return H * wave.baseY
      + Math.sin(x * wave.f + offset) * wave.amp
      + Math.sin(x * wave.f * 1.7 + offset * 1.3) * wave.amp * 0.4
      + Math.sin(x * wave.f * 0.4 + offset * 0.6) * wave.amp * 0.6
      + Math.sin(t * 0.8 + x * 0.002) * wave.amp * 0.2;
  };

  useAnimationFrame((t, dt) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const W = canvas.width;
    const H = canvas.height;

    // STEP 4: SKY NEEDS TO MATCH WATER MOOD
    const sky = ctx.createLinearGradient(0, 0, 0, H * 0.58);
    sky.addColorStop(0, '#000308');
    sky.addColorStop(0.25, '#000812');
    sky.addColorStop(0.55, '#010e1e');
    sky.addColorStop(0.75, '#021528');
    sky.addColorStop(1.0, '#031d35');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H * 0.58);

    // Subtle horizon glow where sky meets water
    const horizonGrad = ctx.createLinearGradient(0, H * 0.54, 0, H * 0.62);
    horizonGrad.addColorStop(0, 'rgba(20,50,100,0)');
    horizonGrad.addColorStop(0.5, 'rgba(15,35,70,0.3)');
    horizonGrad.addColorStop(1, 'rgba(10,25,50,0)');
    ctx.fillStyle = horizonGrad;
    ctx.fillRect(0, H * 0.54, W, H * 0.08);

    // STEP 3: PHOTO REALISTIC WATER
    WAVES.forEach((wave, i) => {
      ctx.beginPath();
      for (let x = 0; x <= W + 2; x += 2) {
        const y = getWaveY(x, wave, t, H);
        if (x === 0) ctx.beginPath(), ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.lineTo(W, H);
      ctx.lineTo(0, H);
      ctx.closePath();

      const grad = ctx.createLinearGradient(0, H * wave.baseY - wave.amp, 0, H);
      grad.addColorStop(0, wave.topColor);
      grad.addColorStop(0.3, wave.midColor);
      grad.addColorStop(1, wave.botColor);
      ctx.fillStyle = grad;
      ctx.fill();

      // STEP C: FOAM THAT LOOKS REAL (On front 2 layers)
      if (i >= WAVES.length - 2) {
        for (let j = 0; j < 20; j++) {
          const x = (W / 20) * j + Math.sin(t + j) * 12;
          const y = getWaveY(x, wave, t, H);
          
          const foamOp = 0.15 + Math.sin(t * 2.5 + j * 0.8) * 0.1;
          const foamR = 2 + Math.sin(t + j) * 1.5;
          
          ctx.beginPath();
          ctx.arc(x, y - 2, foamR, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${foamOp})`;
          ctx.fill();

          // Tiny spray dots
          for (let s = 0; s < 3; s++) {
            ctx.beginPath();
            ctx.arc(
              x + (Math.random() - 0.5) * 8,
              y - 4 - Math.random() * 6,
              0.8, 0, Math.PI * 2
            );
            ctx.fillStyle = `rgba(255,255,255,${foamOp * 0.5})`;
            ctx.fill();
          }
        }
      }
    });

    // STEP B: MOONLIGHT HIGHLIGHTS (Subtle glints only)
    const shimmerX = W * 0.83;
    for (let i = 0; i < 8; i++) {
        const gx = (shimmerX - 30) + i * 8 + Math.sin(t * 1.5 + i) * 6;
        const gy = H * 0.72 + Math.sin(t * 0.8 + i * 0.7) * 12;
        const gop = 0.08 + Math.sin(t * 2 + i) * 0.05;
        
        ctx.beginPath();
        ctx.arc(gx, gy, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180,210,255,${gop})`;
        ctx.fill();
    }

    // STEP D: DEEP WATER DEPTH COLOR
    const depthGrad = ctx.createLinearGradient(0, H * 0.85, 0, H);
    depthGrad.addColorStop(0, 'rgba(0,0,0,0)');
    depthGrad.addColorStop(1, 'rgba(0,3,10,0.7)');
    ctx.fillStyle = depthGrad;
    ctx.fillRect(0, H * 0.85, W, H * 0.15);
  });

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{
        width: '100vw',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        background: '#000308'
      }}
    />
  );
}
