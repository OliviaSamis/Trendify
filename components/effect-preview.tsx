"use client"

import { useEffect, useRef } from "react"

interface EffectPreviewProps {
  effectName: string
}

export function EffectPreview({ effectName }: EffectPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameCountRef = useRef(0)
  const animationFrameRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const width = canvas.width
    const height = canvas.height

    // Create a simple gradient background
    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, "#333")
    gradient.addColorStop(1, "#666")

    // Animation loop
    const animate = () => {
      frameCountRef.current = (frameCountRef.current + 1) % 60
      const progress = frameCountRef.current / 60

      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      // Draw background
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)

      // Draw a sample shape to apply effects to
      ctx.fillStyle = "#4f46e5"
      ctx.beginPath()
      ctx.arc(width / 2, height / 2, Math.min(width, height) / 4, 0, Math.PI * 2)
      ctx.fill()

      // Apply different effects based on name
      switch (effectName) {
        case "Zoom In":
          const scale = 1 + progress * 0.3
          ctx.save()
          ctx.translate(width / 2, height / 2)
          ctx.scale(scale, scale)
          ctx.translate(-width / 2, -height / 2)
          ctx.fillStyle = "#4f46e5"
          ctx.beginPath()
          ctx.arc(width / 2, height / 2, Math.min(width, height) / 4, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
          break

        case "Zoom Out":
          const scaleOut = 1.3 - progress * 0.3
          ctx.save()
          ctx.translate(width / 2, height / 2)
          ctx.scale(scaleOut, scaleOut)
          ctx.translate(-width / 2, -height / 2)
          ctx.fillStyle = "#4f46e5"
          ctx.beginPath()
          ctx.arc(width / 2, height / 2, Math.min(width, height) / 4, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
          break

        case "Fade":
          ctx.globalAlpha = progress
          ctx.fillStyle = "#4f46e5"
          ctx.beginPath()
          ctx.arc(width / 2, height / 2, Math.min(width, height) / 4, 0, Math.PI * 2)
          ctx.fill()
          ctx.globalAlpha = 1
          break

        case "Blur":
          ctx.filter = `blur(${(1 - progress) * 5}px)`
          ctx.fillStyle = "#4f46e5"
          ctx.beginPath()
          ctx.arc(width / 2, height / 2, Math.min(width, height) / 4, 0, Math.PI * 2)
          ctx.fill()
          ctx.filter = "none"
          break

        case "Glitch":
          const sliceHeight = height / 5
          for (let i = 0; i < 5; i++) {
            const offsetX = (Math.random() * 10 - 5) * (1 - progress)
            ctx.fillStyle = "#4f46e5"
            ctx.fillRect(
              width / 2 - Math.min(width, height) / 4 + offsetX,
              i * sliceHeight,
              Math.min(width, height) / 2,
              sliceHeight,
            )
          }
          break

        case "Shake":
          const offsetShakeX = (Math.random() * 10 - 5) * (1 - progress)
          const offsetShakeY = (Math.random() * 10 - 5) * (1 - progress)
          ctx.fillStyle = "#4f46e5"
          ctx.beginPath()
          ctx.arc(width / 2 + offsetShakeX, height / 2 + offsetShakeY, Math.min(width, height) / 4, 0, Math.PI * 2)
          ctx.fill()
          break

        case "Spin":
          const angle = progress * Math.PI * 2
          ctx.save()
          ctx.translate(width / 2, height / 2)
          ctx.rotate(angle)
          ctx.fillStyle = "#4f46e5"
          ctx.fillRect(
            -Math.min(width, height) / 4,
            -Math.min(width, height) / 4,
            Math.min(width, height) / 2,
            Math.min(width, height) / 2,
          )
          ctx.restore()
          break

        case "Flash":
          ctx.fillStyle = "#4f46e5"
          ctx.beginPath()
          ctx.arc(width / 2, height / 2, Math.min(width, height) / 4, 0, Math.PI * 2)
          ctx.fill()

          if (frameCountRef.current < 5 || (frameCountRef.current > 30 && frameCountRef.current < 35)) {
            ctx.fillStyle = "white"
            ctx.fillRect(0, 0, width, height)
          }
          break
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [effectName])

  return <canvas ref={canvasRef} width={120} height={80} className="w-full h-full rounded" />
}
