"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface VideoUploadProps {
  onVideoSelected: (file: File, videoElement: HTMLVideoElement, duration: number) => void
  className?: string
}

export function VideoUpload({ onVideoSelected, className }: VideoUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      processVideoFile(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const file = files[0]
      if (file.type.startsWith("video/")) {
        processVideoFile(file)
      } else {
        alert("Please upload a video file")
      }
    }
  }

  const processVideoFile = (file: File) => {
    setIsLoading(true)

    // Create a video element to get metadata
    const video = document.createElement("video")
    video.preload = "metadata"

    // Set up event handlers
    video.onloadedmetadata = () => {
      setIsLoading(false)

      // Create a blob URL for the file
      const videoUrl = URL.createObjectURL(file)

      // Set the video source
      if (videoRef.current) {
        videoRef.current.src = videoUrl

        // Make sure the video is visible
        videoRef.current.style.display = "block"

        // Pass the file, video element, and duration to the parent component
        onVideoSelected(file, videoRef.current, video.duration)
      }
    }

    video.onerror = () => {
      setIsLoading(false)
      alert("Error loading video. Please try another file.")
    }

    // Set the video source to the file
    video.src = URL.createObjectURL(file)
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 transition-colors",
        isDragging ? "border-purple-500 bg-purple-500/10" : "border-slate-700 hover:border-slate-600",
        className,
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileChange} className="hidden" />

      {isLoading ? (
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="w-8 h-8 border-2 border-slate-600 border-t-purple-500 rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Processing video...</p>
        </div>
      ) : (
        <>
          <Upload className="w-10 h-10 text-muted-foreground mb-2" />
          <h3 className="text-lg font-medium">Drag & drop your video</h3>
          <p className="text-sm text-muted-foreground mb-4">or click to browse files</p>
          <Button
            onClick={handleButtonClick}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
          >
            Select Video
          </Button>
        </>
      )}

      {/* Hidden video element to load the video */}
      <video ref={videoRef} className="hidden" />
    </div>
  )
}
