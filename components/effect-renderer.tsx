"use client"

import { useEffect, useRef } from "react"

interface EffectRendererProps {
  effectName: string
  videoElement: HTMLVideoElement
  isActive: boolean
}

export function EffectRenderer({ effectName, videoElement, isActive }: EffectRendererProps) {
  const appliedRef = useRef(false)
  const intervalRef = useRef<number | null>(null)
  const originalStylesRef = useRef({
    filter: "",
    transform: "",
    transition: "",
    opacity: "",
    transformOrigin: "",
  })

  // Apply or remove effect when isActive changes
  useEffect(() => {
    if (!videoElement) return

    // Save original styles when first mounting
    if (!appliedRef.current) {
      originalStylesRef.current = {
        filter: videoElement.style.filter,
        transform: videoElement.style.transform,
        transition: videoElement.style.transition,
        opacity: videoElement.style.opacity,
        transformOrigin: videoElement.style.transformOrigin,
      }
    }

    // Clear any existing intervals
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    if (isActive) {
      // Add a small transition when applying effects
      videoElement.style.transition = "all 0.2s ease-in-out"

      // Apply the effect with a slight delay to allow for transition
      setTimeout(() => {
        applyEffect()
        appliedRef.current = true
      }, 50)
    } else if (appliedRef.current) {
      // Add a small transition when removing effects
      videoElement.style.transition = "all 0.2s ease-out"

      // Remove the effect with a slight delay to allow for transition
      setTimeout(() => {
        removeEffect()
        appliedRef.current = false
      }, 50)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isActive, effectName, videoElement])

  // Apply effect based on name
  const applyEffect = () => {
    if (!videoElement) return

    // Reset any existing effects first
    videoElement.style.transition = "all 0.3s ease-in-out"
    videoElement.style.transform = ""
    videoElement.style.opacity = "1"
    videoElement.style.filter = originalStylesRef.current.filter || ""

    // Apply different effects based on name with stronger values
    switch (effectName) {
      case "Zoom In":
        videoElement.style.transformOrigin = "center center"
        videoElement.style.transform = "scale(1.3)" // Increased from 1.2
        break

      case "Zoom Out":
        videoElement.style.transformOrigin = "center center"
        videoElement.style.transform = "scale(0.7)" // Decreased from 0.8
        break

      case "Fade":
        videoElement.style.opacity = "0.6" // More fade than before
        break

      case "Blur":
        videoElement.style.filter = `${originalStylesRef.current.filter || ""} blur(8px)` // Increased from 5px
        break

      case "Glitch":
        // Apply a continuous glitch effect with interval
        let glitchCount = 0
        intervalRef.current = window.setInterval(() => {
          glitchCount++
          if (glitchCount % 2 === 0) {
            videoElement.style.filter = `${originalStylesRef.current.filter || ""} hue-rotate(90deg) contrast(180%)` // Increased contrast
            videoElement.style.transform = "translate(5px, -5px)" // Larger movement
          } else {
            videoElement.style.filter = `${originalStylesRef.current.filter || ""} hue-rotate(180deg) contrast(180%)`
            videoElement.style.transform = "translate(-5px, 5px)"
          }
        }, 80) as unknown as number // Faster interval
        break

      case "Shake":
        // Apply a continuous shake effect with interval
        intervalRef.current = window.setInterval(() => {
          const xOffset = Math.random() * 12 - 6 // Larger shake
          const yOffset = Math.random() * 12 - 6
          videoElement.style.transform = `translate(${xOffset}px, ${yOffset}px)`
        }, 40) as unknown as number // Faster interval
        break

      case "Spin":
        videoElement.style.transformOrigin = "center center"
        videoElement.style.transition = "transform 2s linear"
        videoElement.style.transform = "rotate(360deg)"
        // Set up continuous rotation
        intervalRef.current = window.setInterval(() => {
          videoElement.style.transform =
            videoElement.style.transform === "rotate(360deg)" ? "rotate(0deg)" : "rotate(360deg)"
        }, 2000) as unknown as number
        break

      case "Flash":
        // Apply a continuous flash effect with interval
        let flashState = false
        intervalRef.current = window.setInterval(() => {
          flashState = !flashState
          videoElement.style.filter = flashState
            ? `${originalStylesRef.current.filter || ""} brightness(2.5)` // Brighter flash
            : originalStylesRef.current.filter || ""
        }, 300) as unknown as number // Faster flashing
        break

      default:
        break
    }
  }

  // Remove effect and restore original styles
  const removeEffect = () => {
    if (!videoElement) return

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    // Restore original styles
    videoElement.style.filter = originalStylesRef.current.filter
    videoElement.style.transform = originalStylesRef.current.transform
    videoElement.style.transition = originalStylesRef.current.transition
    videoElement.style.opacity = originalStylesRef.current.opacity
    videoElement.style.transformOrigin = originalStylesRef.current.transformOrigin
  }

  return null
}
