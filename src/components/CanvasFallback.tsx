import { useEffect, useRef } from 'react'

interface CanvasFallbackProps {
  reducedMotion: boolean
  highContrast: boolean
}

export function CanvasFallback({ reducedMotion, highContrast }: CanvasFallbackProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return

    let frame = 0
    let pointer = { x: 0.5, y: 0.5 }
    let pressure = 0
    let stillness = 0
    let previousInput = performance.now()
    let raf = 0

    const move = (event: PointerEvent) => {
      pointer = { x: event.clientX / innerWidth, y: event.clientY / innerHeight }
      pressure = Math.min(1, pressure + 0.08)
      stillness = 0
      previousInput = performance.now()
    }

    const draw = (now: number) => {
      const ratio = Math.min(devicePixelRatio, 1.25)
      const width = Math.max(1, canvas.clientWidth)
      const height = Math.max(1, canvas.clientHeight)
      if (canvas.width !== width * ratio || canvas.height !== height * ratio) {
        canvas.width = width * ratio
        canvas.height = height * ratio
      }
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      context.fillStyle = '#020303'
      context.fillRect(0, 0, width, height)

      if (now - previousInput > 320) stillness = Math.min(1, stillness + 0.0025)
      pressure *= 0.995
      const motion = reducedMotion ? 0 : now * 0.000025
      const centerX = width * (0.57 + Math.sin(motion) * 0.018)
      const centerY = height * 0.5

      const halo = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, height * 0.58)
      halo.addColorStop(0, highContrast ? 'rgba(190,195,178,.13)' : 'rgba(94,112,98,.12)')
      halo.addColorStop(0.42, 'rgba(22,35,28,.08)')
      halo.addColorStop(1, 'rgba(0,0,0,0)')
      context.fillStyle = halo
      context.fillRect(0, 0, width, height)

      const watched = Math.hypot(pointer.x * width - centerX, pointer.y * height - centerY)
      const withdrawal = Math.max(0.1, Math.min(1, watched / (height * 0.4)))
      context.save()
      context.globalAlpha = (0.25 + stillness * 0.36) * withdrawal * (1 - pressure * 0.5)
      context.strokeStyle = highContrast ? '#dad9ca' : '#718176'
      context.lineWidth = 1
      context.beginPath()
      for (let y = -height * 0.05; y <= height * 1.05; y += 4) {
        const normalized = (y - centerY) / height
        const half = height * (0.13 + Math.cos(normalized * 5) * 0.014)
        const distortion = Math.sin(y * 0.035 + motion * 20) * 8
        if (y === -height * 0.05) context.moveTo(centerX - half + distortion, y)
        else context.lineTo(centerX - half + distortion, y)
      }
      context.stroke()
      context.restore()

      context.strokeStyle = `rgba(115,135,120,${0.06 + stillness * 0.18})`
      context.beginPath()
      context.ellipse(centerX + width * 0.12, centerY, height * 0.38, height * 0.45, 0, 0, Math.PI * 2)
      context.stroke()

      frame += 1
      if (frame % (reducedMotion ? 4 : 1) === 0) raf = requestAnimationFrame(draw)
      else raf = requestAnimationFrame(draw)
    }

    window.addEventListener('pointermove', move, { passive: true })
    raf = requestAnimationFrame(draw)
    return () => {
      window.removeEventListener('pointermove', move)
      cancelAnimationFrame(raf)
    }
  }, [reducedMotion, highContrast])

  return <canvas ref={canvasRef} className="visual-canvas" data-renderer="canvas-fallback" aria-hidden="true" />
}
