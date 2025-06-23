import type React from 'react'
import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  opacity: number
  color: string
  connections: number[]
}

const ParticleBackground: React.FC<{ density?: number }> = ({ density = 80 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number>()
  const mouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initParticles()
    }

    const initParticles = () => {
      const particles: Particle[] = []
      const numParticles = Math.floor((canvas.width * canvas.height) / 15000 * (density / 100))

      for (let i = 0; i < numParticles; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: Math.random() * 2 + 1,
          opacity: Math.random() * 0.6 + 0.3,
          color: Math.random() > 0.6 ? '#ffd700' : Math.random() > 0.3 ? '#e6c200' : '#d4af37',
          connections: []
        })
      }

      particlesRef.current = particles
    }

    const drawParticle = (particle: Particle) => {
      ctx.save()
      ctx.globalAlpha = particle.opacity
      ctx.fillStyle = particle.color
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
      ctx.fill()

      // Add glow effect for golden particles
      if (particle.color === '#ffd700') {
        ctx.shadowColor = '#ffd700'
        ctx.shadowBlur = 15
        ctx.fill()
      }
      if (particle.color === '#e6c200') {
        ctx.shadowColor = '#e6c200'
        ctx.shadowBlur = 12
        ctx.fill()
      }

      ctx.restore()
    }

    const drawConnection = (p1: Particle, p2: Particle, distance: number) => {
      const maxDistance = 120
      const opacity = Math.max(0, (maxDistance - distance) / maxDistance) * 0.3

      ctx.save()
      ctx.globalAlpha = opacity
      ctx.strokeStyle = p1.color === '#ffd700' || p2.color === '#ffd700' ? '#ffd700' :
                        p1.color === '#e6c200' || p2.color === '#e6c200' ? '#e6c200' : '#d4af37'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(p1.x, p1.y)
      ctx.lineTo(p2.x, p2.y)
      ctx.stroke()
      ctx.restore()
    }

    const updateParticle = (particle: Particle) => {
      // Update position
      particle.x += particle.vx
      particle.y += particle.vy

      // Bounce off edges
      if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
      if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1

      // Keep particles in bounds
      particle.x = Math.max(0, Math.min(canvas.width, particle.x))
      particle.y = Math.max(0, Math.min(canvas.height, particle.y))

      // Mouse interaction
      const mouseDistance = Math.sqrt(
        Math.pow(particle.x - mouseRef.current.x, 2) +
        Math.pow(particle.y - mouseRef.current.y, 2)
      )

      if (mouseDistance < 100) {
        const force = (100 - mouseDistance) / 100
        const angle = Math.atan2(particle.y - mouseRef.current.y, particle.x - mouseRef.current.x)
        particle.vx += Math.cos(angle) * force * 0.01
        particle.vy += Math.sin(angle) * force * 0.01
        particle.opacity = Math.min(1, particle.opacity + force * 0.02)
      } else {
        particle.opacity = Math.max(0.2, particle.opacity - 0.01)
      }

      // Add slight random movement
      particle.vx += (Math.random() - 0.5) * 0.001
      particle.vy += (Math.random() - 0.5) * 0.001

      // Limit velocity
      const maxVelocity = 0.8
      particle.vx = Math.max(-maxVelocity, Math.min(maxVelocity, particle.vx))
      particle.vy = Math.max(-maxVelocity, Math.min(maxVelocity, particle.vy))
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const particles = particlesRef.current

      // Update and draw particles
      particles.forEach(particle => {
        updateParticle(particle)
        drawParticle(particle)
      })

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 120) {
            drawConnection(particles[i], particles[j], distance)
          }
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX
      mouseRef.current.y = e.clientY
    }

    const handleResize = () => {
      resizeCanvas()
    }

    // Initialize
    resizeCanvas()
    animate()

    // Event listeners
    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [density])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: 'transparent' }}
    />
  )
}

export default ParticleBackground
