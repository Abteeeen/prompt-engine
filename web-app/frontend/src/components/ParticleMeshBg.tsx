import React, { useEffect, useRef } from 'react'

const CONFIG = {
  shapesCount: 15,
  speed: 1.2,
  baseSize: 30,
  shapeOpacity: 0.12,
  meshOpacity: 0.25,
  densityDist: 250, // Connection distance
}

class Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string

  constructor(w: number, h: number) {
    this.x = Math.random() * w
    this.y = Math.random() * h
    const angle = Math.random() * Math.PI * 2
    this.vx = Math.cos(angle) * CONFIG.speed * (Math.random() * 0.5 + 0.5)
    this.vy = Math.sin(angle) * CONFIG.speed * (Math.random() * 0.5 + 0.5)
    this.size = Math.random() * CONFIG.baseSize + 10
    
    // Randomize shape color for a slight cyber/tech aesthetic
    const colors = [
      `rgba(139, 92, 246, ${CONFIG.shapeOpacity})`, // Purple
      `rgba(6, 182, 212, ${CONFIG.shapeOpacity})`,  // Cyan
      `rgba(255, 255, 255, ${CONFIG.shapeOpacity})` // White
    ]
    this.color = colors[Math.floor(Math.random() * colors.length)]
  }

  update(w: number, h: number) {
    this.x += this.vx
    this.y += this.vy
    
    // Bounce off walls
    if (this.x < 0 || this.x > w) this.vx *= -1
    if (this.y < 0 || this.y > h) this.vy *= -1
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fillStyle = this.color
    ctx.fill()
  }
}

export function ParticleMeshBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = canvas.width = window.innerWidth
    let h = canvas.height = window.innerHeight

    const handleResize = () => {
      w = canvas.width = window.innerWidth
      h = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    const particles: Particle[] = []
    const count = window.innerWidth < 768 ? Math.floor(CONFIG.shapesCount / 2) : CONFIG.shapesCount
    
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(w, h))
    }

    let animFrame: number

    const draw = () => {
      // Clear canvas
      ctx.clearRect(0, 0, w, h)

      // Update and draw particles
      particles.forEach(p => {
        p.update(w, h)
        p.draw(ctx)
      })

      // Draw connections (mesh)
      ctx.lineWidth = 1
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < CONFIG.densityDist) {
            // Calculate opacity based on distance
            const opacity = (1 - (dist / CONFIG.densityDist)) * CONFIG.meshOpacity
            ctx.beginPath()
            ctx.strokeStyle = `rgba(139, 92, 246, ${opacity})` // Glowing purple lines
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }

      animFrame = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animFrame)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ mixBlendMode: 'screen', opacity: 0.8 }}
    />
  )
}
