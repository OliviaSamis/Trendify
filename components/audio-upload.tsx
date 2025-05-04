"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Music } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AudioUploadProps {
  onAudioSelected: (file: File, audioElement: HTMLAudioElement, duration: number) => void
  className?: string
}

export function AudioUpload({ onAudioSelected, className }: AudioUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      processAudioFile(files[0])
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
      if (file.type.startsWith("audio/")) {
        processAudioFile(file)
      } else {
        alert("Please upload an audio file")
      }
    }
  }

  const processAudioFile = (file: File) => {
    setIsLoading(true)

    // Create an audio element to get metadata
    const audio = document.createElement("audio")
    audio.preload = "metadata"

    // Set up event handlers
    audio.onloadedmetadata = () => {
      setIsLoading(false)

      // Create a blob URL for the file
      const audioUrl = URL.createObjectURL(file)

      // Set the audio source
      if (audioRef.current) {
        audioRef.current.src = audioUrl

        // Pass the file, audio element, and duration to the parent component
        onAudioSelected(file, audioRef.current, audio.duration)
      }
    }

    audio.onerror = () => {
      setIsLoading(false)
      alert("Error loading audio. Please try another file.")
    }

    // Set the audio source to the file
    audio.src = URL.createObjectURL(file)
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
      <input ref={fileInputRef} type="file" accept="audio/*" onChange={handleFileChange} className="hidden" />

      {isLoading ? (
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="w-8 h-8 border-2 border-slate-600 border-t-purple-500 rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Processing audio...</p>
        </div>
      ) : (
        <>
          <Music className="w-10 h-10 text-muted-foreground mb-2" />
          <h3 className="text-lg font-medium">Drag & drop your audio</h3>
          <p className="text-sm text-muted-foreground mb-4">or click to browse files</p>
          <Button
            onClick={handleButtonClick}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
          >
            Select Audio
          </Button>
        </>
      )}

      {/* Hidden audio element to load the audio */}
      <audio ref={audioRef} className="hidden" />
    </div>
  )
}
