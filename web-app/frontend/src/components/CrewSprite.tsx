import React, { useState, useEffect } from 'react';
import { removeTealBg } from '../utils/removeTealBg';

interface Character {
  id: string;
  name: string;
  role: string;
  sprite: string;
  frameW: number;
  frameH: number;
  steps: number;
  left: string;
  bottom: string;
  specialty: string;
}

const CREW_DATA: Character[] = [
  { id: 'luffy', name: 'LUFFY', role: 'The Idea Agent', sprite: '/sprites/luffy.png', frameW: 72, frameH: 80, steps: 4, left: '40%', bottom: '37%', specialty: 'Ideation' },
  { id: 'zoro', name: 'ZORO', role: 'The Debugger', sprite: '/sprites/zoro.png', frameW: 80, frameH: 85, steps: 4, left: '32%', bottom: '35%', specialty: 'Code Optimization' },
  { id: 'sanji', name: 'SANJI', role: 'The Creative Chef', sprite: '/sprites/sanji.png', frameW: 75, frameH: 90, steps: 4, left: '58%', bottom: '35%', specialty: 'UI/UX Design' },
  { id: 'nami', name: 'NAMI', role: 'The SEO Navigator', sprite: '/sprites/nami.png', frameW: 70, frameH: 88, steps: 4, left: '49%', bottom: '54%', specialty: 'Market Analysis' },
  { id: 'usopp', name: 'USOPP', role: 'The Content Sniper', sprite: '/sprites/usopp.png', frameW: 90, frameH: 85, steps: 4, left: '37%', bottom: '36%', specialty: 'Copywriting' },
  { id: 'chopper', name: 'CHOPPER', role: 'The Data Doctor', sprite: '/sprites/chopper.png', frameW: 65, frameH: 70, steps: 4, left: '51%', bottom: '36%', specialty: 'Data Processing' },
  { id: 'robin', name: 'ROBIN', role: 'The Knowledge Archaeologist', sprite: '/sprites/robin.png', frameW: 72, frameH: 95, steps: 4, left: '63%', bottom: '34%', specialty: 'Historical Research' },
];

export function CrewSprite({ onSelect }: { onSelect: (c: Character) => void }) {
  const [processedSprites, setProcessedSprites] = useState<Record<string, string>>({});

  useEffect(() => {
    CREW_DATA.forEach(async (char) => {
      const cleanSprite = await removeTealBg(char.sprite);
      setProcessedSprites(prev => ({ ...prev, [char.id]: cleanSprite }));
    });
  }, []);

  return (
    <>
      {CREW_DATA.map((char) => (
        <div
          key={char.id}
          className="char"
          onClick={() => onSelect(char)}
          style={{
            left: char.left,
            bottom: char.bottom,
            width: `${char.frameW * 2.5}px`,
            height: `${char.frameH * 2.5}px`,
            backgroundImage: processedSprites[char.id] ? `url(${processedSprites[char.id]})` : 'none',
            backgroundSize: `${(processedSprites[char.id] ? 100 : 0)}% auto`,
            animation: processedSprites[char.id] ? `play-${char.id} 0.8s steps(${char.steps}) infinite` : 'none',
          }}
        >
          <style>{`
            @keyframes play-${char.id} {
              from { background-position: 0 0; }
              to { background-position: -${char.frameW * char.steps * 2.5}px 0; }
            }
          `}</style>
        </div>
      ))}
      <style>{`
        .char {
          position: absolute;
          image-rendering: pixelated;
          cursor: pointer;
          transform: translateY(var(--ship-bob, 0px));
          filter: drop-shadow(0 8px 16px rgba(0,0,0,0.95));
          transition: filter 0.2s, transform 0.1s;
          z-index: 10;
          background-repeat: no-repeat;
        }
        .char:hover {
          filter: 
            drop-shadow(0 8px 16px rgba(0,0,0,0.95))
            brightness(1.3)
            drop-shadow(0 0 12px rgba(255,200,50,0.8));
          transform: 
            translateY(calc(var(--ship-bob,0px) - 12px)) 
            scale(1.15);
        }
      `}</style>
    </>
  );
}
