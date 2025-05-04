"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

interface CropToolProps {
  videoElement: HTMLVideoElement | null
  onApply: (cropData: { x: number; y: number; width: number; height: number }) => void
  onCancel: () => void
}

export function CropTool({ videoElement, onApply, onCancel }: CropToolProps) {
  const [cropRect, setCropRect] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    isDragging: false,
    startX: 0,
    startY: 0,
  })
  const [isSelecting, setIsSelecting] = useState(true)
  const cropAreaRef = useRef<HTMLDivElement>(null)
  const [videoSize, setVideoSize] = useState({ width: 0, height: 0 })

  // Initialize crop area when component mounts
  useEffect(() => {
    if (videoElement && cropAreaRef.current) {
      const videoWidth = videoElement.videoWidth || 640
      const videoHeight = videoElement.videoHeight || 360

      setVideoSize({ width: videoWidth, height: videoHeight })

      // Start with a default crop that's 80% of the video size
      setCropRect({
        x: videoWidth * 0.1,
        y: videoHeight * 0.1,
        width: videoWidth * 0.8,
        height: videoHeight * 0.8,
        isDragging: false,
        startX: 0,
        startY: 0,
      })
    }
  }, [videoElement])

  // Handle mouse down to start crop selection
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!cropAreaRef.current || !isSelecting) return

    const rect = cropAreaRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Calculate position relative to the actual video dimensions
    const scaleX = videoSize.width / rect.width
    const scaleY = videoSize.height / rect.height

    const videoX = x * scaleX
    const videoY = y * scaleY

    setCropRect({
      ...cropRect,
      x: videoX,
      y: videoY,
      width: 0,
      height: 0,
      isDragging: true,
      startX: videoX,
      startY: videoY,
    })
  }

  // Handle mouse move to update crop selection
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cropAreaRef.current || !cropRect.isDragging) return

    const rect = cropAreaRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Calculate position relative to the actual video dimensions
    const scaleX = videoSize.width / rect.width
    const scaleY = videoSize.height / rect.height

    const videoX = x * scaleX
    const videoY = y * scaleY

    setCropRect({
      ...cropRect,
      x: Math.min(cropRect.startX, videoX),
      y: Math.min(cropRect.startY, videoY),
      width: Math.abs(videoX - cropRect.startX),
      height: Math.abs(videoY - cropRect.startY),
    })
  }

  // Handle mouse up to finish crop selection
  const handleMouseUp = () => {
    setCropRect({
      ...cropRect,
      isDragging: false,
    })
    setIsSelecting(false)
  }

  // Handle apply crop
  const handleApplyCrop = () => {
    if (videoElement) {
      // Ensure we have a valid crop area
      if (cropRect.width < 10 || cropRect.height < 10) {
        alert("Please select a larger crop area")
        return
      }

      onApply({
        x: cropRect.x,
        y: cropRect.y,
        width: cropRect.width,
        height: cropRect.height,
      })
    }
  }

  // Safely get video source
  const videoSrc = videoElement?.src || ""

  // Handle case where video element is null
  if (!videoElement) {
    return (
      <div className="relative w-full h-full bg-black flex items-center justify-center">
        <p className="text-white">Video not available</p>
        <Button
          variant="outline"
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-slate-800 border-slate-700 hover:bg-slate-700 text-white"
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    )
  }

  // Calculate display dimensions for the crop rectangle
  const displayRect = cropAreaRef.current
    ? {
        left: `${(cropRect.x / videoSize.width) * 100}%`,
        top: `${(cropRect.y / videoSize.height) * 100}%`,
        width: `${(cropRect.width / videoSize.width) * 100}%`,
        height: `${(cropRect.height / videoSize.height) * 100}%`,
      }
    : { left: "0", top: "0", width: "0", height: "0" }

  return (
    <div className="relative w-full h-full bg-black">
      <div
        ref={cropAreaRef}
        className="absolute inset-0 flex items-center justify-center cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Video frame */}
        <img src={videoSrc || "/placeholder.svg"} alt="Video frame" className="max-w-full max-h-full object-contain" />

        {/* Crop overlay */}
        <div className="absolute inset-0 bg-black/50">
          {/* Crop selection rectangle */}
          <div
            className="absolute border-2 border-white"
            style={{
              left: displayRect.left,
              top: displayRect.top,
              width: displayRect.width,
              height: displayRect.height,
            }}
          >
            {/* Resize handles */}
            <div className="absolute -top-1 -left-1 w-3 h-3 bg-white rounded-full" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full" />
            <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-white rounded-full" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white rounded-full" />
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        <Button
          variant="outline"
          onClick={onCancel}
          className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-white"
        >
          Cancel
        </Button>
        <Button
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
          onClick={handleApplyCrop}
        >
          <Check className="h-4 w-4 mr-2" />
          Apply Crop
        </Button>
      </div>

      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-slate-800/90 text-white px-4 py-2 rounded text-sm">
        {isSelecting ? "Click and drag to select crop area" : "Adjust the crop area or click Apply"}
      </div>
    </div>
  )
}
