import { useEffect, useRef } from 'react'

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  rotate: number
  spin: number
}

const COLORS = ['#f3c4ce', '#c9a227', '#7eb89a', '#fff6f8', '#e8a0b0', '#2f5d45']

export function Confetti({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!active) return undefined

    const canvas = canvasRef.current
    if (!canvas) return undefined

    const ctx = canvas.getContext('2d')
    if (!ctx) return undefined

    let frame = 0
    let raf = 0
    const particles: Particle[] = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    for (let i = 0; i < 110; i += 1) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * canvas.height * 0.4,
        vx: (Math.random() - 0.5) * 2.4,
        vy: 1.4 + Math.random() * 3.2,
        size: 4 + Math.random() * 7,
        color: COLORS[i % COLORS.length],
        rotate: Math.random() * Math.PI,
        spin: (Math.random() - 0.5) * 0.2,
      })
    }

    const draw = () => {
      frame += 1
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.012
        p.rotate += p.spin
        if (p.y > canvas.height + 20) {
          p.y = -20
          p.x = Math.random() * canvas.width
          p.vy = 1.4 + Math.random() * 2.4
        }
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rotate)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.55)
        ctx.restore()
      })
      if (frame < 420) {
        raf = window.requestAnimationFrame(draw)
      }
    }

    raf = window.requestAnimationFrame(draw)

    return () => {
      window.cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [active])

  if (!active) return null

  return <canvas className="confetti-layer" ref={canvasRef} aria-hidden="true" />
}
