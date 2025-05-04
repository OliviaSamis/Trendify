"use client"

import type React from "react"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import {
  ChevronRight,
  Crop,
  Film,
  Layers,
  Layout,
  Maximize2,
  Music,
  Play,
  Save,
  Scissors,
  Share2,
  Text,
  Upload,
  Video,
  Home,
  Pause,
  Volume2,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Clock,
  Slash,
  Square,
  Trash2,
  Minus,
  Plus,
  ImageIcon,
  FileText,
  Split,
  PictureInPicture,
  Undo2,
  Redo2,
  Mic,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import ExportModal from "@/components/export-modal"
import { VideoUpload } from "@/components/video-upload"
import { AudioUpload } from "@/components/audio-upload"
import { TextOverlay } from "@/components/text-overlay"
import { ImageOverlay } from "@/components/image-overlay"
import { FileUploadDialog } from "@/components/file-upload-dialog"
import { Input } from "@/components/ui/input"
import { EffectRenderer } from "@/components/effect-renderer"
import { CropTool } from "@/components/crop-tool"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ColorPicker } from "@/components/color-picker"
import { SuggestionHelper } from "@/components/suggestion-helper"
import { CaptionGenerator } from "@/components/caption-generator"
import { cn } from "@/lib/utils"
import { VoiceRecorderDialog } from "@/components/voice-recorder-dialog"

// Define types for our data structures
type Clip = {
  id: number
  type: "video" | "text" | "effect" | "audio" | "image"
  start: number
  end: number
  color: string
  name: string
  src?: string
  videoStart?: number
  videoEnd?: number
  effectName?: string
  filterName?: string
}

type TextItem = {
  id: number
  text: string
  position: { x: number; y: number }
  style: {
    bold: boolean
    italic: boolean
    underline: boolean
    align: "left" | "center" | "right"
    fontSize?: number
    color?: string
  }
  startTime: number
  endTime: number
}

type ImageItem = {
  id: number
  src: string
  position: { x: number; y: number }
  size: { width: number; height: number }
  startTime: number
  endTime: number
  type: "image" | "pdf"
  pdfPage?: number
  totalPages?: number
}

type EffectItem = {
  id: number
  name: string
  startTime: number
  endTime: number
}

type AudioTrack = {
  id: number
  name: string
  src: string
  startTime: number
  duration: number
  volume: number
}

type MediaItem = {
  id: number
  name: string
  thumbnail: string
  description: string
}

type TextStyle = {
  bold: boolean
  italic: boolean
  underline: boolean
  align: "left" | "center" | "right"
  fontSize?: number
  color?: string
}

type Filter = {
  name: string
  filter: string
}

// Add proper error handling and null checks to the editor page

// Add these safety checks at the beginning of the component
export default function Editor() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const platform = searchParams?.get("platform") || ""
  const niche = searchParams?.get("niche") || ""
  const trend = searchParams?.get("trend") || ""
  const videoId = searchParams?.get("id") || null

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioRefs = useRef<{ [key: number]: HTMLAudioElement }>({})
  const videoContainerRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)

  // Add proper default values for all state variables
  const [playing, setPlaying] = useState<boolean>(false)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [duration, setDuration] = useState<number>(0)
  const [volume, setVolume] = useState<number>(80)
  const [selectedClip, setSelectedClip] = useState<number | null>(null)
  const [selectedTool, setSelectedTool] = useState<string>("trim")
  const [selectedTextId, setSelectedTextId] = useState<number | null>(null)
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null)
  const [textStyle, setTextStyle] = useState<TextStyle>({
    bold: false,
    italic: false,
    underline: false,
    align: "center",
    fontSize: 24,
    color: "#ffffff",
  })
  const [exportModalOpen, setExportModalOpen] = useState<boolean>(false)
  const [importModalOpen, setImportModalOpen] = useState<boolean>(false)
  const [audioModalOpen, setAudioModalOpen] = useState<boolean>(false)
  const [imageModalOpen, setImageModalOpen] = useState<boolean>(false)
  const [pdfModalOpen, setPdfModalOpen] = useState<boolean>(false)
  const [saveModalOpen, setSaveModalOpen] = useState<boolean>(false)
  const [videoTitle, setVideoTitle] = useState<string>("")
  const [activeVideo, setActiveVideo] = useState<string | null>(null)
  const [hasImportedVideo, setHasImportedVideo] = useState<boolean>(false)
  const [showCropTool, setShowCropTool] = useState<boolean>(false)
  const [cropData, setCropData] = useState<{ x: number; y: number; width: number; height: number } | null>(null)
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [trimStart, setTrimStart] = useState<number>(0)
  const [trimEnd, setTrimEnd] = useState<number>(0)
  const [videoThumbnail, setVideoThumbnail] = useState<string | null>(null)
  const [importProjectModalOpen, setImportProjectModalOpen] = useState<boolean>(false)
  const [history, setHistory] = useState<any[]>([])
  const [future, setFuture] = useState<any[]>([])
  const [lastActionTimestamp, setLastActionTimestamp] = useState<number>(Date.now())
  const [voiceRecorderOpen, setVoiceRecorderOpen] = useState<boolean>(false)

  // Text overlays
  const [textOverlays, setTextOverlays] = useState<TextItem[]>([])

  // Image overlays
  const [imageOverlays, setImageOverlays] = useState<ImageItem[]>([])

  // Effect items
  const [effectItems, setEffectItems] = useState<EffectItem[]>([])

  // Audio tracks
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([])

  // Clips for the timeline - start with empty array
  const [clips, setClips] = useState<Clip[]>([])

  // Function to save current state to history - defined early to avoid circular references
  const saveToHistory = useCallback(
    (actionName: string) => {
      // Debounce history saving to prevent too many entries for rapid changes
      const now = Date.now()
      if (now - lastActionTimestamp < 500) return

      setLastActionTimestamp(now)

      const currentState = {
        clips: [...clips],
        textOverlays: [...textOverlays],
        imageOverlays: [...imageOverlays],
        effectItems: [...effectItems],
        audioTracks: [...audioTracks],
        cropData: cropData ? { ...cropData } : null,
        activeFilter,
        actionName,
        timestamp: now,
      }

      setHistory((prev) => [...prev.slice(-19), currentState]) // Keep last 20 states
      setFuture([]) // Clear redo stack when a new action is performed
    },
    [clips, textOverlays, imageOverlays, effectItems, audioTracks, cropData, activeFilter, lastActionTimestamp],
  )

  // Sample effects with descriptions and preview images
  const effects: MediaItem[] = [
    {
      id: 1,
      name: "Zoom In",
      thumbnail: "/placeholder.svg?height=80&width=120",
      description: "Gradually zooms in on the center of the frame",
    },
    {
      id: 2,
      name: "Zoom Out",
      thumbnail: "/placeholder.svg?height=80&width=120",
      description: "Gradually zooms out from the center of the frame",
    },
    {
      id: 3,
      name: "Fade",
      thumbnail: "/placeholder.svg?height=80&width=120",
      description: "Smoothly fades in from black",
    },
    {
      id: 4,
      name: "Blur",
      thumbnail: "/placeholder.svg?height=80&width=120",
      description: "Applies a blur effect that gradually clears",
    },
    {
      id: 5,
      name: "Glitch",
      thumbnail: "/placeholder.svg?height=80&width=120",
      description: "Creates a digital glitch distortion effect",
    },
    {
      id: 6,
      name: "Shake",
      thumbnail: "/placeholder.svg?height=80&width=120",
      description: "Adds camera shake movement to the video",
    },
    {
      id: 7,
      name: "Spin",
      thumbnail: "/placeholder.svg?height=80&width=120",
      description: "Rotates the entire frame in a circular motion",
    },
    {
      id: 8,
      name: "Flash",
      thumbnail: "/placeholder.svg?height=80&width=120",
      description: "Creates quick white flashes for transitions",
    },
  ]

  // Sample filters
  const filters: Filter[] = [
    { name: "Normal", filter: "none" },
    { name: "Vintage", filter: "sepia(0.5) contrast(1.2) brightness(0.9)" },
    { name: "Noir", filter: "grayscale(1) contrast(1.5)" },
    { name: "Warm", filter: "sepia(0.3) saturate(1.3) contrast(1.1)" },
    { name: "Cool", filter: "saturate(0.8) hue-rotate(30deg)" },
    { name: "Vibrant", filter: "saturate(1.5) contrast(1.2)" },
    { name: "Muted", filter: "saturate(0.7) brightness(1.1)" },
  ]

  // Sample text styles
  const textStyles = [
    {
      name: "Title",
      style: {
        bold: true,
        italic: false,
        underline: false,
        align: "center" as const,
        fontSize: 36,
        color: "#ffffff",
      },
      description: "Large, bold text for main titles",
    },
    {
      name: "Subtitle",
      style: {
        bold: false,
        italic: false,
        underline: false,
        align: "center" as const,
        fontSize: 24,
        color: "#ffffff",
      },
      description: "Medium-sized text for secondary information",
    },
    {
      name: "Caption",
      style: {
        bold: false,
        italic: false,
        underline: false,
        align: "left" as const,
        fontSize: 18,
        color: "#ffffff",
      },
      description: "Small text for captions and descriptions",
    },
    {
      name: "Quote",
      style: {
        bold: false,
        italic: true,
        underline: false,
        align: "center" as const,
        fontSize: 28,
        color: "#ffffff",
      },
      description: "Stylized text for quotations",
    },
    {
      name: "Highlight",
      style: {
        bold: true,
        italic: false,
        underline: true,
        align: "center" as const,
        fontSize: 24,
        color: "#ffff00",
      },
      description: "Emphasized text to highlight important points",
    },
  ]

  // Tools configuration
  const tools = useMemo(
    () => [
      { icon: <Scissors />, name: "Trim", id: "trim" },
      { icon: <Crop />, name: "Crop", id: "crop" },
      { icon: <Text />, name: "Text", id: "text" },
      { icon: <PictureInPicture />, name: "Overlays", id: "overlays" },
      { icon: <Layers />, name: "Effects", id: "effects" },
      { icon: <Film />, name: "Filters", id: "filters" },
      { icon: <Music />, name: "Audio", id: "audio" },
      { icon: <Layout />, name: "Transitions", id: "transitions" },
    ],
    [],
  )

  // Format time in MM:SS format
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }, [])

  // Generate a thumbnail from the current video frame
  const generateThumbnail = useCallback(() => {
    if (!videoRef.current || !activeVideo) return null

    const canvas = document.createElement("canvas")
    canvas.width = 320
    canvas.height = 180
    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
      return canvas.toDataURL("image/jpeg")
    }
    return null
  }, [activeVideo])

  // Save the current project
  const saveProject = useCallback(() => {
    if (!activeVideo || !videoTitle.trim()) return

    // Generate thumbnail
    const thumbnail = generateThumbnail()
    setVideoThumbnail(thumbnail)

    // Create project data
    const projectId = videoId || `video_${Date.now()}`
    const projectData = {
      id: projectId,
      title: videoTitle,
      platform,
      niche,
      trend,
      thumbnail,
      dateCreated: new Date().toLocaleDateString(),
      duration: formatTime(duration),
      clips,
      textOverlays,
      imageOverlays,
      effectItems,
      audioTracks,
      cropData,
      activeFilter,
      videoSrc: activeVideo, // Save the video source URL
      lastEdited: new Date().toISOString(),
      version: "1.0",
    }

    try {
      // Get existing videos
      const savedVideosJson = localStorage.getItem("trendAll_videos") || "[]"
      const savedVideos = JSON.parse(savedVideosJson)

      // Update or add the current project
      const existingIndex = savedVideos.findIndex((v: any) => v.id === projectId)
      if (existingIndex >= 0) {
        savedVideos[existingIndex] = projectData
      } else {
        savedVideos.push(projectData)
      }

      // Save back to localStorage
      localStorage.setItem("trendAll_videos", JSON.stringify(savedVideos))

      // Show success message
      alert("Project saved successfully!")

      // Close the save modal
      setSaveModalOpen(false)
    } catch (error) {
      console.error("Error saving project:", error)
      alert("Failed to save your project. Please try again.")
    }
  }, [
    activeVideo,
    videoTitle,
    platform,
    niche,
    trend,
    duration,
    clips,
    textOverlays,
    imageOverlays,
    effectItems,
    audioTracks,
    cropData,
    activeFilter,
    generateThumbnail,
    videoId,
    formatTime,
  ])

  // Add a function to export the project as a JSON file
  const exportProjectFile = useCallback(() => {
    if (!activeVideo || !videoTitle.trim()) {
      alert("Please add a video and give your project a title before exporting.")
      return
    }

    // Create project data
    const projectId = videoId || `video_${Date.now()}`
    const projectData = {
      id: projectId,
      title: videoTitle,
      platform,
      niche,
      trend,
      clips,
      textOverlays,
      imageOverlays,
      effectItems,
      audioTracks,
      cropData,
      activeFilter,
      exportDate: new Date().toISOString(),
      version: "1.0",
    }

    // Convert to JSON
    const jsonData = JSON.stringify(projectData, null, 2)

    // Create a blob and download link
    const blob = new Blob([jsonData], { type: "application/json" })
    const url = URL.createObjectURL(blob)

    // Create download link and trigger click
    const a = document.createElement("a")
    a.href = url
    a.download = `${videoTitle.replace(/\s+/g, "-").toLowerCase()}-project.json`
    document.body.appendChild(a)
    a.click()

    // Clean up
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [
    activeVideo,
    videoTitle,
    platform,
    niche,
    trend,
    clips,
    textOverlays,
    imageOverlays,
    effectItems,
    audioTracks,
    cropData,
    activeFilter,
    videoId,
  ])

  // Add functionality to import a project file
  const handleImportProject = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const projectData = JSON.parse(event.target?.result as string)

        // Validate the project data
        if (!projectData.title || !projectData.clips) {
          throw new Error("Invalid project file")
        }

        // Set project data
        setVideoTitle(projectData.title)
        setClips(projectData.clips || [])
        setTextOverlays(projectData.textOverlays || [])
        setImageOverlays(projectData.imageOverlays || [])
        setEffectItems(projectData.effectItems || [])
        setAudioTracks(projectData.audioTracks || [])
        setCropData(projectData.cropData || null)
        setActiveFilter(projectData.activeFilter || null)

        // Close the modal
        setImportProjectModalOpen(false)

        // Show success message
        alert("Project imported successfully! Note: You'll need to re-import the video file.")

        // Prompt to import video
        setImportModalOpen(true)
      } catch (error) {
        console.error("Error importing project:", error)
        alert("Failed to import project. The file may be corrupted or in an invalid format.")
      }
    }

    reader.readAsText(file)
  }, [])

  // Get active effects at current time
  const activeEffects = useMemo(() => {
    return effectItems.filter((effect) => currentTime >= effect.startTime && currentTime <= effect.endTime)
  }, [effectItems, currentTime])

  // Add proper error handling for the useEffect hooks
  // For example, in the handleTimeUpdate function:
  // For example, in the handleTimeUpdate function:
  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return

    try {
      const currentVideoTime = videoRef.current.currentTime

      // Use requestAnimationFrame for smoother updates
      requestAnimationFrame(() => {
        setCurrentTime(currentVideoTime)
      })

      // Find the active video clip
      const activeVideoSrc = videoRef.current.src
      const videoClip = clips.find((clip) => clip.type === "video" && clip.src === activeVideoSrc)

      if (videoClip) {
        // If we're before the start trim point, jump to start
        if (currentVideoTime < videoClip.start) {
          videoRef.current.currentTime = videoClip.start
          setCurrentTime(videoClip.start)
        }

        // If we've reached the end trim point, pause the video
        if (currentVideoTime >= videoClip.end) {
          videoRef.current.pause()
          setPlaying(false)

          // Find the next video clip, if any
          const currentIndex = clips.findIndex((clip) => clip.id === videoClip.id)
          const nextVideoClip = clips.find((clip, index) => clip.type === "video" && index > currentIndex)

          if (nextVideoClip && nextVideoClip.src) {
            // Switch to the next video
            videoRef.current.src = nextVideoClip.src
            videoRef.current.currentTime = nextVideoClip.start || 0
            setCurrentTime(nextVideoClip.start || 0)
            setActiveVideo(nextVideoClip.src)
            setSelectedClip(nextVideoClip.id)

            // Auto-play the next video
            videoRef.current.play()
            setPlaying(true)
          } else {
            // No more videos, jump back to start point for looping playback
            setTimeout(() => {
              if (videoRef.current) {
                videoRef.current.currentTime = videoClip.start
                setCurrentTime(videoClip.start)
              }
            }, 500)
          }
        }
      }

      // Sync audio tracks with video
      if (audioRefs.current) {
        Object.values(audioRefs.current || {}).forEach((audio) => {
          if (audio && Math.abs(audio.currentTime - currentVideoTime) > 0.1) {
            audio.currentTime = currentVideoTime
          }
        })
      }
    } catch (error) {
      console.error("Error in handleTimeUpdate:", error)
    }
  }, [clips, setPlaying, setCurrentTime, setActiveVideo, setSelectedClip])

  // Handle video ended
  const handleVideoEnded = useCallback(() => {
    setPlaying(false)
    if (videoRef.current) {
      videoRef.current.currentTime = 0
      setCurrentTime(0)

      // Reset audio tracks
      if (audioRefs.current) {
        Object.values(audioRefs.current || {}).forEach((audio) => {
          if (audio) {
            audio.pause()
            audio.currentTime = 0
          }
        })
      }
    }
  }, [])

  // Handle play/pause
  const togglePlayPause = useCallback(() => {
    if (!videoRef.current || !activeVideo) return

    if (playing) {
      videoRef.current.pause()
      // Pause all audio tracks
      Object.values(audioRefs.current || {}).forEach((audio) => audio?.pause())
      setPlaying(false)
    } else {
      // Use a try-catch block to handle potential AbortError
      try {
        const playPromise = videoRef.current.play()

        // Handle the play promise properly
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              // Play all audio tracks only after video successfully plays
              Object.values(audioRefs.current || {}).forEach((audio) => {
                if (audio) {
                  if (audio.currentTime >= audio.duration) {
                    audio.currentTime = 0
                  }
                  audio.play().catch((e) => console.error("Error playing audio:", e))
                }
              })
              setPlaying(true)
            })
            .catch((error) => {
              console.error("Error playing video:", error)
              setPlaying(false)
            })
        } else {
          // For browsers that don't return a promise
          setPlaying(true)
        }
      } catch (error) {
        console.error("Error in togglePlayPause:", error)
        setPlaying(false)
      }
    }
  }, [playing, activeVideo])

  // Handle seeking
  const handleSeek = useCallback(
    (value: number) => {
      const videoClip = clips.find((clip) => clip.type === "video")

      // Ensure we don't seek outside the trim range
      let seekTime = value
      if (videoClip) {
        seekTime = Math.max(videoClip.start, Math.min(value, videoClip.end))
      }

      setCurrentTime(seekTime)
      if (videoRef.current) {
        videoRef.current.currentTime = seekTime

        // Sync audio tracks
        if (audioRefs.current) {
          Object.values(audioRefs.current || {}).forEach((audio) => {
            if (audio) audio.currentTime = seekTime
          })
        }
      }
    },
    [clips],
  )

  // Handle volume change
  const handleVolumeChange = useCallback((value: number) => {
    setVolume(value)
    if (videoRef.current) {
      videoRef.current.volume = value / 100
    }
  }, [])

  // Handle video selection
  const handleVideoSelected = useCallback(
    (file: File, videoElement: HTMLVideoElement, videoDuration: number) => {
      const videoUrl = URL.createObjectURL(file)
      setActiveVideo(videoUrl)
      setDuration(videoDuration)
      setHasImportedVideo(true)
      setImportModalOpen(false)
      setCropData(null) // Reset crop data for new video
      setVideoTitle(file.name.replace(/\.[^/.]+$/, "")) // Set default title from filename

      // Create a new clip for the imported video
      const newClip: Clip = {
        id: Date.now(),
        type: "video",
        start: 0,
        end: videoDuration,
        color: "#4f46e5",
        name: file.name.substring(0, 20) + (file.name.length > 20 ? "..." : ""),
        src: videoUrl,
        videoStart: 0,
        videoEnd: videoDuration,
      }

      // Replace any existing clips with just this video clip
      setClips([newClip])
      setSelectedClip(newClip.id)

      // Set the video element properties
      if (videoRef.current) {
        videoRef.current.src = videoUrl
        videoRef.current.volume = volume / 100

        // Ensure the video is visible by setting display to block
        videoRef.current.style.display = "block"
      }

      // Reset text overlays and audio tracks for new video
      setTextOverlays([])
      setImageOverlays([])
      setEffectItems([])
      setAudioTracks([])

      // Reset current time
      setCurrentTime(0)

      // Reset trim values
      setTrimStart(0)
      setTrimEnd(videoDuration)

      // Reset active effects and filters
      setActiveFilter(null)
      saveToHistory("Import video")
    },
    [volume, saveToHistory],
  )

  // Handle audio selection
  const handleAudioSelected = useCallback(
    (file: File, audioElement: HTMLAudioElement, audioDuration: number) => {
      const audioUrl = URL.createObjectURL(file)
      setAudioModalOpen(false)

      // Create a new audio track
      const newAudioTrack: AudioTrack = {
        id: Date.now(),
        name: file.name.substring(0, 20) + (file.name.length > 20 ? "..." : ""),
        src: audioUrl,
        startTime: 0,
        duration: audioDuration,
        volume: 80,
      }

      setAudioTracks((prev) => [...prev, newAudioTrack])

      // Create a new clip for the timeline
      const newClip: Clip = {
        id: newAudioTrack.id,
        type: "audio",
        start: 0,
        end: audioDuration,
        color: "#ef4444",
        name: newAudioTrack.name,
        src: audioUrl,
      }

      setClips((prev) => [...prev, newClip])
      setSelectedClip(newClip.id)
      saveToHistory("Add audio")
    },
    [saveToHistory],
  )

  // Handle image selection
  const handleImageSelected = useCallback(
    (file: File, fileUrl: string, fileType: string, dimensions?: { width: number; height: number }) => {
      setImageModalOpen(false)
      setPdfModalOpen(false)

      const isImage = fileType.startsWith("image/")
      const isPdf = fileType === "application/pdf"

      if (!isImage && !isPdf) {
        alert("Unsupported file type")
        return
      }

      // Default dimensions if not provided
      const defaultWidth = 300
      const defaultHeight = isImage ? 200 : 400

      // Create new image overlay
      const newImageId = Date.now()
      const newImage: ImageItem = {
        id: newImageId,
        src: fileUrl,
        position: {
          x: (videoContainerRef.current?.clientWidth || 800) / 2 - (dimensions?.width || defaultWidth) / 2,
          y: (videoContainerRef.current?.clientHeight || 450) / 2 - (dimensions?.height || defaultHeight) / 2,
        },
        size: {
          width: dimensions?.width || defaultWidth,
          height: dimensions?.height || defaultHeight,
        },
        startTime: currentTime,
        endTime: currentTime + 5,
        type: isImage ? "image" : "pdf",
        pdfPage: 1,
        totalPages: 1, // This would need to be determined for PDFs
      }

      setImageOverlays((prev) => [...prev, newImage])
      setSelectedImageId(newImageId)

      // Create a new clip for the timeline
      const newClip: Clip = {
        id: newImageId,
        type: "image",
        start: currentTime,
        end: currentTime + 5,
        color: isImage ? "#0ea5e9" : "#8b5cf6", // Blue for images, purple for PDFs
        name: isImage ? "Image: " + file.name.substring(0, 15) : "PDF: " + file.name.substring(0, 15),
      }

      setClips((prev) => [...prev, newClip])
      setSelectedClip(newClip.id)

      // Switch to overlays tool
      setSelectedTool("overlays")
      saveToHistory("Add image")
    },
    [currentTime, videoContainerRef, saveToHistory],
  )

  // Handle importing media
  const handleImportMedia = useCallback(() => {
    setImportModalOpen(true)
  }, [])

  // Handle adding audio
  const handleAddAudio = useCallback(() => {
    setAudioModalOpen(true)
  }, [])

  // Add a new state for the voice recorder dialog

  // Add a function to handle voice recording save
  const handleVoiceRecordingSave = useCallback(
    (audioBlob: Blob, audioDuration: number) => {
      // Create a URL for the audio blob
      const audioUrl = URL.createObjectURL(audioBlob)

      // Create a name for the recording
      const recordingName = `Voice Recording ${new Date().toLocaleTimeString()}`

      // Create a new audio track
      const newAudioTrack: AudioTrack = {
        id: Date.now(),
        name: recordingName,
        src: audioUrl,
        startTime: currentTime,
        duration: audioDuration,
        volume: 80,
      }

      setAudioTracks((prev) => [...prev, newAudioTrack])

      // Create a new clip for the timeline
      const newClip: Clip = {
        id: newAudioTrack.id,
        type: "audio",
        start: currentTime,
        end: currentTime + audioDuration,
        color: "#ef4444",
        name: recordingName,
        src: audioUrl,
      }

      setClips((prev) => [...prev, newClip])
      setSelectedClip(newClip.id)
      saveToHistory("Add voice recording")
    },
    [currentTime, saveToHistory],
  )

  // Add a function to open the voice recorder
  const handleAddVoiceOver = useCallback(() => {
    setVoiceRecorderOpen(true)
  }, [])

  // Handle adding image
  const handleAddImage = useCallback(() => {
    setImageModalOpen(true)
  }, [])

  // Handle adding PDF
  const handleAddPdf = useCallback(() => {
    setPdfModalOpen(true)
  }, [])

  // Handle adding text
  const handleAddText = useCallback(() => {
    if (!videoContainerRef.current || !activeVideo) return

    const containerRect = videoContainerRef.current.getBoundingClientRect()

    // Create new text overlay
    const newTextId = Date.now()
    const newText: TextItem = {
      id: newTextId,
      text: "Edit this text",
      position: {
        x: containerRect.width / 2 - 100,
        y: containerRect.height / 2 - 20,
      },
      style: { ...textStyle },
      startTime: currentTime,
      endTime: currentTime + 5,
    }

    setTextOverlays((prev) => [...prev, newText])
    setSelectedTextId(newTextId)

    // Create a new clip for the timeline
    const newClip: Clip = {
      id: newTextId,
      type: "text",
      start: currentTime,
      end: currentTime + 5,
      color: "#10b981",
      name: "Text: " + newText.text.substring(0, 15),
    }

    setClips((prev) => [...prev, newClip])
    setSelectedClip(newClip.id)

    // Switch to text tool
    setSelectedTool("text")
    saveToHistory("Add text")
  }, [currentTime, textStyle, videoContainerRef, activeVideo, saveToHistory])

  // Handle text position change
  const handleTextPositionChange = useCallback((id: number, position: { x: number; y: number }) => {
    setTextOverlays((prev) => prev.map((text) => (text.id === id ? { ...text, position } : text)))
  }, [])

  // Handle text content change
  const handleTextContentChange = useCallback((id: number, newText: string) => {
    setTextOverlays((prev) => prev.map((text) => (text.id === id ? { ...text, text: newText } : text)))

    // Update clip name
    setClips((prev) =>
      prev.map((clip) =>
        clip.id === id && clip.type === "text" ? { ...clip, name: "Text: " + newText.substring(0, 15) } : clip,
      ),
    )
  }, [])

  // Handle image position change
  const handleImagePositionChange = useCallback((id: number, position: { x: number; y: number }) => {
    setImageOverlays((prev) => prev.map((img) => (img.id === id ? { ...img, position } : img)))
  }, [])

  // Handle image size change
  const handleImageSizeChange = useCallback((id: number, size: { width: number; height: number }) => {
    setImageOverlays((prev) => prev.map((img) => (img.id === id ? { ...img, size } : img)))
  }, [])

  // Handle PDF page change
  const handlePdfPageChange = useCallback((id: number, page: number) => {
    setImageOverlays((prev) => prev.map((img) => (img.id === id ? { ...img, pdfPage: page } : img)))
  }, [])

  // Handle text deletion
  const handleDeleteText = useCallback((id: number) => {
    setTextOverlays((prev) => prev.filter((text) => text.id !== id))
    setClips((prev) => prev.filter((clip) => !(clip.id === id && clip.type === "text")))
    setSelectedTextId(null)
  }, [])

  // Handle image deletion
  const handleDeleteImage = useCallback((id: number) => {
    setImageOverlays((prev) => prev.filter((img) => img.id !== id))
    setClips((prev) => prev.filter((clip) => !(clip.id === id && clip.type === "image")))
    setSelectedImageId(null)
  }, [])

  // Handle effect deletion
  const handleDeleteEffect = useCallback((id: number) => {
    setEffectItems((prev) => prev.filter((effect) => effect.id !== id))
    setClips((prev) => prev.filter((clip) => !(clip.id === id && clip.type === "effect")))
  }, [])

  // Handle text style changes
  const handleTextStyleChange = useCallback(
    (property: keyof TextStyle, value: any) => {
      // Update the global text style
      setTextStyle((prev) => ({
        ...prev,
        [property]: value,
      }))

      // Apply to selected text if any
      if (selectedTextId) {
        // Immediately update the text overlay with the new style
        setTextOverlays((prev) =>
          prev.map((text) =>
            text.id === selectedTextId
              ? {
                  ...text,
                  style: {
                    ...text.style,
                    [property]: value,
                  },
                }
              : text,
          ),
        )

        // If we're changing the color, also update the clip name to reflect this
        if (property === "color" && selectedClip) {
          const textOverlay = textOverlays.find((t) => t.id === selectedTextId)
          if (textOverlay) {
            setClips((prev) =>
              prev.map((clip) =>
                clip.id === selectedTextId && clip.type === "text"
                  ? { ...clip, name: `Text: ${textOverlay.text.substring(0, 15)}` }
                  : clip,
              ),
            )
          }
        }
      }
    },
    [selectedTextId, selectedClip, textOverlays],
  )

  // Apply text style preset
  const applyTextStyle = useCallback(
    (style: TextStyle) => {
      if (!selectedTextId) return

      setTextOverlays((prev) => prev.map((text) => (text.id === selectedTextId ? { ...text, style } : text)))

      // Also update the current text style
      setTextStyle(style)
    },
    [selectedTextId],
  )

  // Handle crop tool
  const handleCropClick = useCallback(() => {
    if (!videoRef.current || !activeVideo) return

    // Pause video
    videoRef.current.pause()
    setPlaying(false)

    // Show crop tool
    setShowCropTool(true)
  }, [activeVideo])

  // Handle crop apply
  const handleApplyCrop = useCallback(
    (cropData: { x: number; y: number; width: number; height: number }) => {
      setCropData(cropData)
      setShowCropTool(false)

      // Apply crop to video element
      if (videoRef.current && cropData) {
        // Store the original video dimensions for reference
        const videoWidth = videoRef.current.videoWidth
        const videoHeight = videoRef.current.videoHeight

        // Calculate scale factors
        const scaleX = videoRef.current.offsetWidth / videoWidth
        const scaleY = videoRef.current.offsetHeight / videoHeight

        // Apply the crop visually by adjusting the video display
        videoRef.current.style.objectFit = "none"
        videoRef.current.style.width = `${videoWidth}px`
        videoRef.current.style.height = `${videoHeight}px`
        videoRef.current.style.maxWidth = "none"
        videoRef.current.style.maxHeight = "none"
        videoRef.current.style.transform = `scale(${videoWidth / cropData.width}) translate(${-cropData.x}px, ${-cropData.y}px)`
        videoRef.current.style.transformOrigin = "0 0"

        // Adjust the container to maintain aspect ratio
        if (videoContainerRef.current) {
          const containerAspect = cropData.width / cropData.height
          videoContainerRef.current.style.aspectRatio = `${containerAspect}`
        }

        // Alert the user that the crop has been applied
        alert("Crop applied successfully. The crop will be applied when exporting the video.")
      }
      saveToHistory("Crop video")
    },
    [saveToHistory],
  )

  // Handle crop cancel
  const handleCancelCrop = useCallback(() => {
    setShowCropTool(false)
  }, [])

  // Handle trim click - now focuses on the video clip in the timeline
  const handleTrimClick = useCallback(() => {
    if (!activeVideo) return

    // Find the video clip
    const videoClip = clips.find((clip) => clip.type === "video")
    if (videoClip) {
      setSelectedClip(videoClip.id)
      setSelectedTool("trim")

      // Scroll to ensure the video track is visible
      const videoTrackElement = document.querySelector('[data-track="video"]')
      if (videoTrackElement) {
        videoTrackElement.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    }
  }, [activeVideo, clips])

  // Handle cut clip at current position
  const handleCutClip = useCallback(() => {
    if (!selectedClip || !activeVideo) return

    const clipToCut = clips.find((clip) => clip.id === selectedClip)
    if (!clipToCut) return

    // Only allow cutting video clips for now
    if (clipToCut.type !== "video") {
      alert("Currently, only video clips can be cut.")
      return
    }

    // Ensure current time is within the clip's range
    if (currentTime <= clipToCut.start || currentTime >= clipToCut.end) {
      alert("The playhead must be positioned within the clip to cut it.")
      return
    }

    // Create two new clips from the original
    const firstClipId = Date.now()
    const secondClipId = firstClipId + 1

    const firstClip: Clip = {
      ...clipToCut,
      id: firstClipId,
      end: currentTime,
      name: `${clipToCut.name} (Part 1)`,
    }

    const secondClip: Clip = {
      ...clipToCut,
      id: secondClipId,
      start: currentTime,
      name: `${clipToCut.name} (Part 2)`,
    }

    // Replace the original clip with the two new clips
    setClips((prev) => {
      const newClips = [...prev.filter((clip) => clip.id !== clipToCut.id), firstClip, secondClip]

      // Sort clips by start time to ensure proper playback order
      return newClips.sort((a, b) => {
        if (a.type === b.type) {
          return a.start - b.start
        }
        // Keep different types of clips in their respective tracks
        return 0
      })
    })

    // Select the second clip
    setSelectedClip(secondClipId)

    // Update the video element to reflect the changes
    if (videoRef.current) {
      // Keep playing the current position
      videoRef.current.currentTime = currentTime
    }

    // Alert the user
    alert(`Clip cut at ${formatTime(currentTime)}. You can now select and delete either part.`)
  }, [selectedClip, activeVideo, currentTime, clips, formatTime])

  // Update clip trim values
  const updateClipTrim = useCallback(
    (clipId: number, start: number, end: number) => {
      // Update the clip's start and end times in the clips array
      setClips((prevClips) => prevClips.map((clip) => (clip.id === clipId ? { ...clip, start, end } : clip)))

      // Update text overlay times if it's a text clip
      const textClip = clips.find((c) => c.id === clipId && c.type === "text")
      if (textClip) {
        setTextOverlays((prev) =>
          prev.map((text) => (text.id === clipId ? { ...text, startTime: start, endTime: end } : text)),
        )
      }

      // Update image overlay times if it's an image clip
      const imageClip = clips.find((c) => c.id === clipId && c.type === "image")
      if (imageClip) {
        setImageOverlays((prev) =>
          prev.map((img) => (img.id === clipId ? { ...img, startTime: start, endTime: end } : img)),
        )
      }

      // Update effect times if it's an effect clip
      const effectClip = clips.find((c) => c.id === clipId && c.type === "effect")
      if (effectClip) {
        setEffectItems((prev) =>
          prev.map((effect) => (effect.id === clipId ? { ...effect, startTime: start, endTime: end } : effect)),
        )

        // If we're currently playing and the effect is selected, seek to the start of the effect
        if ((playing && currentTime < start) || currentTime > end) {
          handleSeek(start)
        }

        console.log(`Effect ${effectClip.effectName} trimmed: ${formatTime(start)} - ${formatTime(end)}`)
      }

      // Update audio track times if it's an audio clip
      const audioClip = clips.find((c) => c.id === clipId && c.type === "audio")
      if (audioClip) {
        setAudioTracks((prev) => prev.map((track) => (track.id === clipId ? { ...track, startTime: start } : track)))
      }

      // If it's a video clip, update the playback range
      const videoClip = clips.find((c) => c.id === clipId && c.type === "video")
      if (videoClip && videoRef.current) {
        // If current time is outside the new range, adjust it
        if (currentTime < start) {
          videoRef.current.currentTime = start
          setCurrentTime(start)
        } else if (currentTime > end) {
          videoRef.current.currentTime = start
          setCurrentTime(start)
        }

        // Update trim values
        setTrimStart(start)
        setTrimEnd(end)
      }
      saveToHistory("Trim clip")
    },
    [clips, currentTime, playing, handleSeek, formatTime, saveToHistory],
  )

  // Apply effect
  const applyEffect = useCallback(
    (effectName: string) => {
      if (!videoRef.current || !activeVideo) return

      // Create a new effect item
      const newEffectId = Date.now()
      const newEffect: EffectItem = {
        id: newEffectId,
        name: effectName,
        startTime: currentTime,
        endTime: Math.min(currentTime + 5, duration), // 5 seconds duration by default, capped at video length
      }

      setEffectItems((prev) => [...prev, newEffect])

      // Create a new clip for the timeline
      const newClip: Clip = {
        id: newEffectId,
        type: "effect",
        start: currentTime,
        end: Math.min(currentTime + 5, duration),
        color: "#f59e0b",
        name: `Effect: ${effectName}`,
        effectName: effectName,
      }

      setClips((prev) => [...prev, newClip])

      // Select the new effect clip
      setSelectedClip(newEffectId)

      // Switch to the effects tool
      setSelectedTool("effects")

      // Alert the user that the effect has been added
      alert(
        `Effect "${effectName}" added at ${formatTime(currentTime)}. You can adjust its duration by trimming in the timeline.`,
      )
      saveToHistory(`Add ${effectName} effect`)
    },
    [currentTime, activeVideo, duration, formatTime, setSelectedTool, saveToHistory],
  )

  // Apply filter
  const applyFilter = useCallback(
    (filterName: string) => {
      if (!videoRef.current || !activeVideo) return

      // Find the filter
      const filter = filters.find((f) => f.name === filterName)
      if (!filter) return

      // Apply the filter to the video
      if (videoRef.current) {
        videoRef.current.style.filter = filter.filter
      }

      // Set the active filter
      setActiveFilter(filterName)

      // Create a new filter clip if it doesn't exist
      const existingFilterClip = clips.find((clip) => clip.type === "effect" && clip.filterName)

      if (!existingFilterClip) {
        const newFilterId = Date.now()
        const newFilter: Clip = {
          id: newFilterId,
          type: "effect",
          start: 0,
          end: duration, // Apply to entire video
          color: "#9333ea", // Purple for filters
          name: `Filter: ${filterName}`,
          filterName: filterName,
        }

        setClips((prev) => [...prev, newFilter])
      } else {
        // Update the existing filter clip
        setClips((prev) =>
          prev.map((clip) =>
            clip.id === existingFilterClip.id
              ? { ...clip, name: `Filter: ${filterName}`, filterName: filterName }
              : clip,
          ),
        )
      }
      saveToHistory(`Apply ${filterName} filter`)
    },
    [activeVideo, duration, clips, filters, saveToHistory],
  )

  // Check if text should be visible at current time
  const isTextVisibleAtTime = useCallback((text: TextItem, time: number) => {
    return time >= text.startTime && time <= text.endTime
  }, [])

  // Check if image should be visible at current time
  const isImageVisibleAtTime = useCallback((image: ImageItem, time: number) => {
    return time >= image.startTime && time <= image.endTime
  }, [])

  // Check if effect should be active at current time
  const isEffectActiveAtTime = useCallback((effect: EffectItem, time: number) => {
    // Add a small buffer (0.01 seconds) to avoid edge cases
    return time >= effect.startTime - 0.01 && time <= effect.endTime + 0.01
  }, [])

  // Handle export button click
  const handleExport = useCallback(() => {
    setExportModalOpen(true)
  }, [])

  // Handle save button click
  const handleSave = useCallback(() => {
    setSaveModalOpen(true)
  }, [])

  // Handle go to library
  const handleGoToLibrary = useCallback(() => {
    router.push("/library")
  }, [router])

  // Get the selected clip
  const selectedClipData = useMemo(() => clips.find((clip) => clip.id === selectedClip), [clips, selectedClip])

  // Get the selected text overlay
  const selectedTextData = useMemo(
    () => textOverlays.find((text) => text.id === selectedTextId),
    [textOverlays, selectedTextId],
  )

  // Get the selected image overlay
  const selectedImageData = useMemo(
    () => imageOverlays.find((img) => img.id === selectedImageId),
    [imageOverlays, selectedImageId],
  )

  // Get the selected effect
  const selectedEffectData = useMemo(() => {
    if (!selectedClip) return null
    const clip = clips.find((c) => c.id === selectedClip && c.type === "effect")
    if (!clip) return null
    return effectItems.find((e) => e.id === clip.id)
  }, [clips, effectItems, selectedClip])

  // Filter clips by track type
  const getClipsByTrack = useCallback(
    (trackType: Clip["type"]) => {
      return clips.filter((clip) => clip.type === trackType)
    },
    [clips],
  )

  // Handle timeline click for scrubbing
  const handleTimelineClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!timelineRef.current || !duration) return

      const rect = timelineRef.current.getBoundingClientRect()
      const clickPosition = e.clientX - rect.left
      const timelineWidth = rect.width
      const clickPercentage = clickPosition / timelineWidth
      const newTime = clickPercentage * duration

      handleSeek(newTime)
    },
    [duration, handleSeek],
  )

  // Add a new function to handle smooth playhead movement
  // Add this function after the handleTimelineClick function:

  const handlePlayheadDrag = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!timelineRef.current || !duration) return

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!timelineRef.current) return

        const rect = timelineRef.current.getBoundingClientRect()
        const clickPosition = moveEvent.clientX - rect.left
        const timelineWidth = rect.width
        const clickPercentage = Math.max(0, Math.min(clickPosition / timelineWidth, 1))
        const newTime = clickPercentage * duration

        handleSeek(newTime)
        moveEvent.preventDefault()
      }

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }

      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      e.preventDefault()
    },
    [duration, handleSeek],
  )

  // Handle clip deletion - allow deleting main video clips
  const handleDeleteClip = useCallback(
    (clipId: number) => {
      const clipToDelete = clips.find((clip) => clip.id === clipId)
      if (!clipToDelete) return

      // Handle different clip types
      switch (clipToDelete.type) {
        case "text":
          // Delete text overlay
          handleDeleteText(clipId)
          break
        case "image":
          // Delete image overlay
          handleDeleteImage(clipId)
          break
        case "effect":
          // Delete effect
          handleDeleteEffect(clipId)
          // If it's a filter effect, reset the filter
          if (clipToDelete.filterName && activeFilter === clipToDelete.filterName) {
            setActiveFilter(null)
            if (videoRef.current) {
              videoRef.current.style.filter = "none"
            }
          }
          // Clear selection
          setSelectedClip(null)
          break
        case "audio":
          // Remove audio track
          setAudioTracks((prev) => prev.filter((track) => track.id !== clipId))
          // Remove clip
          setClips((prev) => prev.filter((clip) => clip.id !== clipId))
          // Clear selection
          setSelectedClip(null)
          break
        case "video":
          // Store the current playback state
          const wasPlaying = playing
          if (wasPlaying && videoRef.current) {
            videoRef.current.pause()
            setPlaying(false)
          }

          // Allow deleting video clips
          setClips((prev) => {
            // Get the clip we're deleting
            const clipToRemove = prev.find((c) => c.id === clipId)
            if (!clipToRemove) return prev

            // Calculate the duration of the clip being removed
            const clipDuration = clipToRemove.end - clipToRemove.start

            // Filter out the deleted clip
            const newClips = prev.filter((clip) => clip.id !== clipId)

            // Adjust all remaining clips to account for the removed duration
            // If the deleted clip was at the beginning, shift everything back
            if (clipToRemove.start === 0) {
              return newClips.map((clip) => ({
                ...clip,
                // Shift all clips to the left by the duration of the deleted clip
                start: Math.max(0, clip.start - clipDuration),
                end: Math.max(0, clip.end - clipDuration),
              }))
            }

            return newClips
          })

          // Adjust text overlays
          setTextOverlays((prev) => {
            const clipToRemove = clips.find((c) => c.id === clipId)
            if (!clipToRemove) return prev

            const clipDuration = clipToRemove.end - clipToRemove.start

            if (clipToRemove.start === 0) {
              return prev.map((text) => ({
                ...text,
                startTime: Math.max(0, text.startTime - clipDuration),
                endTime: Math.max(0, text.endTime - clipDuration),
              }))
            }
            return prev
          })

          // Adjust image overlays
          setImageOverlays((prev) => {
            const clipToRemove = clips.find((c) => c.id === clipId)
            if (!clipToRemove) return prev

            const clipDuration = clipToRemove.end - clipToRemove.start

            if (clipToRemove.start === 0) {
              return prev.map((img) => ({
                ...img,
                startTime: Math.max(0, img.startTime - clipDuration),
                endTime: Math.max(0, img.endTime - clipDuration),
              }))
            }
            return prev
          })

          // Adjust effect items
          setEffectItems((prev) => {
            const clipToRemove = clips.find((c) => c.id === clipId)
            if (!clipToRemove) return prev

            const clipDuration = clipToRemove.end - clipToRemove.start

            if (clipToRemove.start === 0) {
              return prev.map((effect) => ({
                ...effect,
                startTime: Math.max(0, effect.startTime - clipDuration),
                endTime: Math.max(0, effect.endTime - clipDuration),
              }))
            }
            return prev
          })

          // If we deleted the currently playing video, update the video element
          if (videoRef.current && clipToDelete.src === videoRef.current.src) {
            // Find another video clip to play, if any
            const nextVideoClip = clips.find((clip) => clip.type === "video" && clip.id !== clipId)

            if (nextVideoClip && nextVideoClip.src) {
              // Switch to the next video
              videoRef.current.src = nextVideoClip.src
              videoRef.current.currentTime = 0 // Reset to beginning
              setCurrentTime(0)
              setActiveVideo(nextVideoClip.src)
              setSelectedClip(nextVideoClip.id)

              // Update duration to reflect the remaining video
              setDuration(nextVideoClip.end - nextVideoClip.start)

              // Resume playback if it was playing before, with proper error handling
              if (wasPlaying) {
                // Wait for the video to be ready before playing
                const handleCanPlay = () => {
                  if (videoRef.current) {
                    videoRef.current
                      .play()
                      .then(() => setPlaying(true))
                      .catch((e) => {
                        console.error("Error playing video after deletion:", e)
                        setPlaying(false)
                      })
                    videoRef.current.removeEventListener("canplay", handleCanPlay)
                  }
                }

                videoRef.current.addEventListener("canplay", handleCanPlay)
              }
            } else {
              // No more videos, clear the video element
              videoRef.current.src = ""
              setActiveVideo(null)
              setCurrentTime(0)
              setDuration(0)
              setSelectedClip(null)
              setPlaying(false)
            }
          } else {
            // Update the total duration based on remaining video clips
            const remainingVideoClips = clips.filter((c) => c.type === "video" && c.id !== clipId)
            if (remainingVideoClips.length > 0) {
              // Find the maximum end time among remaining clips
              const maxEnd = Math.max(...remainingVideoClips.map((c) => c.end))
              setDuration(maxEnd)
            }
          }
          break
        default:
          // For any other clip types
          setClips((prev) => prev.filter((clip) => clip.id !== clipId))
          setSelectedClip(null)
      }
      saveToHistory(`Delete ${clipToDelete.type}`)
    },
    [clips, handleDeleteText, handleDeleteImage, handleDeleteEffect, activeFilter, playing, setPlaying, saveToHistory],
  )

  // Add a function to switch between videos
  const switchActiveVideo = useCallback(
    (clipId: number) => {
      const videoClip = clips.find((clip) => clip.id === clipId && clip.type === "video")
      if (!videoClip || !videoClip.src || !videoRef.current) return

      // Store current playback state
      const wasPlaying = playing
      if (wasPlaying) {
        videoRef.current.pause()
        setPlaying(false)
      }

      // Update the video element
      videoRef.current.src = videoClip.src
      videoRef.current.currentTime = 0 // Always start at the beginning
      setCurrentTime(0)
      setActiveVideo(videoClip.src)

      // Update duration to reflect this clip's length
      const clipDuration = videoClip.end - videoClip.start
      setDuration(clipDuration)

      // Select the clip
      setSelectedClip(clipId)

      // Resume playback if it was playing before, with proper error handling
      if (wasPlaying) {
        // Wait for the video to be ready before playing
        const handleCanPlay = () => {
          if (videoRef.current) {
            videoRef.current
              .play()
              .then(() => setPlaying(true))
              .catch((e) => {
                console.error("Error playing video after switch:", e)
                setPlaying(false)
              })
            videoRef.current.removeEventListener("canplay", handleCanPlay)
          }
        }

        videoRef.current.addEventListener("canplay", handleCanPlay)
      }
    },
    [clips, playing, setPlaying],
  )

  // Handle keyboard delete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        // Check if we're not in an input field
        if (document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
          if (selectedTextId) {
            handleDeleteText(selectedTextId)
          } else if (selectedImageId) {
            handleDeleteImage(selectedImageId)
          } else if (selectedClip) {
            handleDeleteClip(selectedClip)
          }
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedTextId, selectedImageId, selectedClip, handleDeleteText, handleDeleteImage, handleDeleteClip])

  // Handle tool selection
  useEffect(() => {
    if (selectedTool === "text") {
      // Focus on text tool
      setSelectedTextId(textOverlays.length > 0 ? textOverlays[0].id : null)
    } else if (selectedTool === "crop" && activeVideo && videoRef.current) {
      handleCropClick()
    } else if (selectedTool === "trim" && activeVideo && videoRef.current) {
      handleTrimClick()
    } else if (selectedTool === "effects" && activeVideo) {
      // Find the first effect clip if any exist
      const effectClip = clips.find((clip) => clip.type === "effect")
      if (effectClip) {
        setSelectedClip(effectClip.id)
      }
    } else if (selectedTool === "overlays" && activeVideo) {
      // Focus on image overlays
      setSelectedImageId(imageOverlays.length > 0 ? imageOverlays[0].id : null)
      if (imageOverlays.length > 0) {
        setSelectedClip(imageOverlays[0].id)
      }
    }
  }, [selectedTool, textOverlays, imageOverlays, activeVideo, handleCropClick, handleTrimClick, clips])

  // Add this effect to handle spacebar play/pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle spacebar
      if (e.code === "Space" || e.key === " ") {
        // Don't trigger if user is typing in an input or textarea
        if (
          document.activeElement?.tagName !== "INPUT" &&
          document.activeElement?.tagName !== "TEXTAREA" &&
          !document.activeElement?.isContentEditable
        ) {
          e.preventDefault() // Prevent page scrolling
          togglePlayPause()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [togglePlayPause])

  // Add a useEffect to handle video loading errors
  useEffect(() => {
    if (videoRef.current) {
      const handleError = (e: ErrorEvent) => {
        console.error("Video error:", e)
        setPlaying(false)
      }

      videoRef.current.addEventListener("error", handleError as EventListener)

      return () => {
        if (videoRef.current) {
          videoRef.current.removeEventListener("error", handleError as EventListener)
        }
      }
    }
  }, [videoRef])

  // Initialize audioRefs
  useEffect(() => {
    // Ensure audioRefs.current is initialized
    if (!audioRefs.current) {
      audioRefs.current = {}
    }

    return () => {
      // Clean up audio elements
      if (audioRefs.current) {
        Object.values(audioRefs.current).forEach((audio) => {
          if (audio) {
            audio.pause()
            audio.currentTime = 0
          }
        })
      }
    }
  }, [])

  // Undo function
  const handleUndo = useCallback(() => {
    if (history.length === 0) return

    // Get the last state from history
    const prevState = history[history.length - 1]
    const newHistory = history.slice(0, -1)

    // Save current state to future for redo
    const currentState = {
      clips: [...clips],
      textOverlays: [...textOverlays],
      imageOverlays: [...imageOverlays],
      effectItems: [...effectItems],
      audioTracks: [...audioTracks],
      cropData: cropData ? { ...cropData } : null,
      activeFilter,
      actionName: "current state",
      timestamp: Date.now(),
    }

    // Update state with previous state
    setClips(prevState.clips)
    setTextOverlays(prevState.textOverlays)
    setImageOverlays(prevState.imageOverlays)
    setEffectItems(prevState.effectItems)
    setAudioTracks(prevState.audioTracks)
    setCropData(prevState.cropData)
    setActiveFilter(prevState.activeFilter)

    // Update history and future
    setHistory(newHistory)
    setFuture((prev) => [currentState, ...prev])
  }, [history, clips, textOverlays, imageOverlays, effectItems, audioTracks, cropData, activeFilter])

  // Redo function
  const handleRedo = useCallback(() => {
    if (future.length === 0) return

    // Get the first state from future
    const nextState = future[0]
    const newFuture = future.slice(1)

    // Save current state to history
    const currentState = {
      clips: [...clips],
      textOverlays: [...textOverlays],
      imageOverlays: [...imageOverlays],
      effectItems: [...effectItems],
      audioTracks: [...audioTracks],
      cropData: cropData ? { ...cropData } : null,
      activeFilter,
      actionName: "undone state",
      timestamp: Date.now(),
    }

    // Update state with next state
    setClips(nextState.clips)
    setTextOverlays(nextState.textOverlays)
    setImageOverlays(nextState.imageOverlays)
    setEffectItems(nextState.effectItems)
    setAudioTracks(nextState.audioTracks)
    setCropData(nextState.cropData)
    setActiveFilter(nextState.activeFilter)

    // Update history and future
    setHistory((prev) => [...prev, currentState])
    setFuture(newFuture)
  }, [future, clips, textOverlays, imageOverlays, effectItems, audioTracks, cropData, activeFilter])

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-800 to-slate-950 text-white overflow-hidden">
      {/* Import Video Modal */}
      <Dialog open={importModalOpen} onOpenChange={setImportModalOpen}>
        <DialogContent className="sm:max-w-md">
          <VideoUpload onVideoSelected={handleVideoSelected} className="h-64" />
        </DialogContent>
      </Dialog>

      {/* Import Audio Modal */}
      <Dialog open={audioModalOpen} onOpenChange={setAudioModalOpen}>
        <DialogContent className="sm:max-w-md">
          <AudioUpload onAudioSelected={handleAudioSelected} className="h-64" />
        </DialogContent>
      </Dialog>

      {/* Import Image Modal */}
      <FileUploadDialog
        open={imageModalOpen}
        onOpenChange={setImageModalOpen}
        onFileSelected={handleImageSelected}
        title="Add Image Overlay"
        accept="image/png,image/jpeg"
        description="PNG and JPG files are supported"
      />

      {/* Import PDF Modal */}
      <FileUploadDialog
        open={pdfModalOpen}
        onOpenChange={setPdfModalOpen}
        onFileSelected={handleImageSelected}
        title="Add PDF Overlay"
        accept="application/pdf"
        description="PDF files are supported"
      />

      {/* Import Project Modal */}
      <Dialog open={importProjectModalOpen} onOpenChange={setImportProjectModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Import Project</DialogTitle>
            <DialogDescription>Import a previously exported TrendAll project file.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 transition-colors border-muted-foreground/25">
              <input
                type="file"
                accept=".json"
                onChange={handleImportProject}
                className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-primary file:text-white
              hover:file:bg-primary/90"
              />
              <p className="mt-4 text-sm text-muted-foreground">Select a .json project file to import</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportProjectModalOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Voice Recorder Dialog */}
      <VoiceRecorderDialog
        open={voiceRecorderOpen}
        onOpenChange={setVoiceRecorderOpen}
        onSave={handleVoiceRecordingSave}
      />

      {/* Export Modal */}
      <ExportModal
        open={exportModalOpen}
        onOpenChange={setExportModalOpen}
        platform={platform}
        niche={niche}
        trend={trend}
        textOverlays={textOverlays}
        imageOverlays={imageOverlays}
        effectItems={effectItems}
        audioTracks={audioTracks}
        cropData={cropData}
        activeFilter={activeFilter}
        duration={duration}
        videoRef={videoRef}
        clips={clips}
        videoTitle={videoTitle}
        currentTime={currentTime}
        filters={filters}
      />

      {/* Save Project Modal */}
      <Dialog open={saveModalOpen} onOpenChange={setSaveModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save Project</DialogTitle>
            <DialogDescription>Give your project a name to save it to your library.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
              placeholder="My Awesome Video"
              className="bg-zinc-800 border-zinc-700"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveProject} disabled={!videoTitle.trim()}>
              Save Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-zinc-800 bg-gradient-to-r from-slate-900 to-slate-950">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
            TrendAll
          </h1>
          <div className="px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700">
            <div className="flex items-center gap-2 text-sm text-zinc-300">
              <span>{platform}</span>
              <ChevronRight className="h-4 w-4 text-zinc-500" />
              <span>{niche}</span>
              <ChevronRight className="h-4 w-4 text-zinc-500" />
              <span>{trend}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Add the suggestion helper and caption generator here */}
          <div className="flex items-center space-x-2">
            <SuggestionHelper platform={platform} niche={niche} trend={trend} />
            <CaptionGenerator platform={platform} niche={niche} trend={trend} videoTitle={videoTitle} />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 bg-slate-800 border-slate-700 hover:bg-slate-700 hover:text-white"
              >
                <Upload className="h-4 w-4" />
                Import
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setImportModalOpen(true)}>Import Video</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setImportProjectModalOpen(true)}>Import Project</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 bg-slate-800 border-slate-700 hover:bg-slate-700 hover:text-white"
            onClick={handleGoToLibrary}
          >
            <Home className="h-4 w-4" />
            Library
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 bg-slate-800 border-slate-700 hover:bg-slate-700 hover:text-white"
            onClick={handleSave}
            disabled={!activeVideo}
          >
            <Save className="h-4 w-4" />
            Save
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 bg-slate-800 border-slate-700 hover:bg-slate-700 hover:text-white"
                disabled={!activeVideo}
              >
                <Share2 className="h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleExport}>Export Video</DropdownMenuItem>
              <DropdownMenuItem onClick={exportProjectFile}>Export Project File</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Tools */}
        <div className="w-16 border-r border-slate-800/70 bg-slate-900/50 backdrop-blur-sm flex flex-col items-center py-4 gap-4">
          <TooltipProvider>
            {tools.map((tool) => (
              <Tooltip key={tool.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant={selectedTool === tool.id ? "default" : "ghost"}
                    size="icon"
                    className={cn(
                      "rounded-full transition-all",
                      selectedTool === tool.id
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md shadow-purple-500/20"
                        : "text-gray-400 hover:text-white hover:bg-slate-800",
                    )}
                    onClick={() => setSelectedTool(tool.id)}
                    disabled={!activeVideo && tool.id !== "trim"}
                  >
                    {tool.icon}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{tool.name}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Video Preview */}

          <div className="flex-1 flex items-center justify-center p-4 relative">
            <div
              ref={videoContainerRef}
              className="relative aspect-video bg-black rounded-lg overflow-hidden w-full max-w-3xl shadow-lg"
            >
              {/* Video Preview */}
              {!activeVideo ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm">
                  <div className="rounded-full bg-slate-800/80 p-6 mb-4">
                    <Video className="h-16 w-16 text-slate-500" />
                  </div>
                  <p className="text-slate-400 mb-4">
                    {clips.some((clip) => clip.type === "video")
                      ? "Select a video clip from the timeline"
                      : "Start by importing a video file"}
                  </p>
                  <Button
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
                    onClick={handleImportMedia}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Import Video
                  </Button>
                </div>
              ) : (
                <>
                  {showCropTool ? (
                    <CropTool videoElement={videoRef.current} onApply={handleApplyCrop} onCancel={handleCancelCrop} />
                  ) : (
                    <>
                      {/* Video element for direct playback */}
                      <div className="relative w-full h-full">
                        <video
                          ref={videoRef}
                          className={cn(
                            "w-full h-full transition-opacity duration-300",
                            cropData ? "object-none" : "object-contain",
                          )}
                          src={activeVideo}
                          onTimeUpdate={handleTimeUpdate}
                          onEnded={handleVideoEnded}
                          onError={(e) => {
                            console.error("Video error:", e)
                            setPlaying(false)
                          }}
                          onAbort={() => {
                            console.log("Video loading aborted")
                            setPlaying(false)
                          }}
                          playsInline
                        />
                      </div>

                      {/* Effect Renderers */}
                      {effectItems.map((effect) => {
                        const isActive = isEffectActiveAtTime(effect, currentTime)
                        return (
                          <EffectRenderer
                            key={effect.id}
                            effectName={effect.name}
                            videoElement={videoRef.current!}
                            isActive={isActive}
                          />
                        )
                      })}

                      {/* Image Overlays */}
                      {imageOverlays.map(
                        (image) =>
                          isImageVisibleAtTime(image, currentTime) && (
                            <ImageOverlay
                              key={image.id}
                              src={image.src || "/placeholder.svg"}
                              position={image.position}
                              size={image.size}
                              onPositionChange={(position) => handleImagePositionChange(image.id, position)}
                              onSizeChange={(size) => handleImageSizeChange(image.id, size)}
                              onDelete={() => handleDeleteImage(image.id)}
                              isSelected={selectedImageId === image.id}
                              type={image.type}
                              pdfPage={image.pdfPage}
                              onPageChange={
                                image.type === "pdf" ? (page) => handlePdfPageChange(image.id, page) : undefined
                              }
                              totalPages={image.totalPages}
                            />
                          ),
                      )}

                      {/* Text Overlays */}
                      {textOverlays.map(
                        (text) =>
                          isTextVisibleAtTime(text, currentTime) && (
                            <TextOverlay
                              key={text.id}
                              text={text.text}
                              style={text.style}
                              position={text.position}
                              onPositionChange={(position) => handleTextPositionChange(text.id, position)}
                              onTextChange={(newText) => handleTextContentChange(text.id, newText)}
                              onDelete={() => handleDeleteText(text.id)}
                              isSelected={selectedTextId === text.id}
                            />
                          ),
                      )}

                      {/* Audio elements (hidden) */}
                      {audioTracks.map((track) => (
                        <audio
                          key={track.id}
                          ref={(el) => {
                            if (el) audioRefs.current[track.id] = el
                          }}
                          src={track.src}
                          className="hidden"
                        />
                      ))}
                    </>
                  )}
                </>
              )}

              {/* Video Controls Overlay */}
              {!showCropTool && activeVideo && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Slider
                      value={[currentTime]}
                      max={duration || 1}
                      step={0.1}
                      onValueChange={(value) => handleSeek(value[0])}
                      className="flex-1"
                      disabled={!activeVideo}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Button variant="ghost" size="icon" onClick={togglePlayPause} disabled={!activeVideo}>
                        {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                      </Button>
                      <div className="text-sm">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Volume2 className="h-4 w-4" />
                      <Slider
                        value={[volume]}
                        max={100}
                        step={1}
                        onValueChange={(value) => handleVolumeChange(value[0])}
                        className="w-24"
                        disabled={!activeVideo}
                      />
                      <Button variant="ghost" size="icon" disabled={!activeVideo}>
                        <Maximize2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="h-64 border-t border-slate-800/70 bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Button
                  className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-white gap-2"
                  size="sm"
                  onClick={handleImportMedia}
                >
                  <Upload className="h-4 w-4" />
                  Import Video
                </Button>
                <Button
                  className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-white gap-2"
                  size="sm"
                  onClick={handleUndo}
                  disabled={history.length === 0}
                >
                  <Undo2 className="h-4 w-4" />
                  Undo
                </Button>
                <Button
                  className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-white gap-2"
                  size="sm"
                  onClick={handleRedo}
                  disabled={future.length === 0}
                >
                  <Redo2 className="h-4 w-4" />
                  Redo
                </Button>
                <Button
                  className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-white gap-2"
                  size="sm"
                  onClick={handleAddText}
                  disabled={!clips.some((clip) => clip.type === "video")}
                >
                  <Text className="h-4 w-4" />
                  Add Text
                </Button>
                <Button
                  className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-white gap-2"
                  size="sm"
                  onClick={handleAddImage}
                  disabled={!clips.some((clip) => clip.type === "video")}
                >
                  <ImageIcon className="h-4 w-4" />
                  Add Image
                </Button>
                <Button
                  className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-white gap-2"
                  size="sm"
                  onClick={handleAddPdf}
                  disabled={!clips.some((clip) => clip.type === "video")}
                >
                  <FileText className="h-4 w-4" />
                  Add PDF
                </Button>
                <Button
                  className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-white gap-2"
                  size="sm"
                  onClick={handleAddAudio}
                  disabled={!clips.some((clip) => clip.type === "video")}
                >
                  <Music className="h-4 w-4" />
                  Add Audio
                </Button>
                <Button
                  className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-white gap-2"
                  size="sm"
                  onClick={handleAddVoiceOver}
                  disabled={!clips.some((clip) => clip.type === "video")}
                >
                  <Mic className="h-4 w-4" />
                  Record Voice
                </Button>
                <Button
                  className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-white gap-2"
                  size="sm"
                  onClick={handleCutClip}
                  disabled={!selectedClip}
                >
                  <Split className="h-4 w-4" />
                  Cut
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-sm">100%</span>
                <Button variant="ghost" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Timeline Ruler - Only show if there's a video */}
            {activeVideo && (
              <div className="h-6 border-b border-zinc-800 flex relative">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="flex-1 border-r border-zinc-700 text-xs text-zinc-500 flex items-end pb-1">
                    {formatTime(i * (duration / 10))}
                  </div>
                ))}
              </div>
            )}

            {/* Timeline Tracks */}

            <ScrollArea className="h-[calc(100%-4rem)] overflow-y-auto overflow-x-auto">
              {clips.length > 0 ? (
                <div
                  className="space-y-2 pt-2 min-w-[800px]"
                  ref={timelineRef}
                  onClick={handleTimelineClick}
                  style={{ cursor: "pointer" }}
                >
                  {[
                    { type: "video", label: "Videos" },
                    { type: "text", label: "Text" },
                    { type: "image", label: "Images" },
                    { type: "effect", label: "Effects" },
                    { type: "audio", label: "Audio" },
                  ].map((track) => (
                    <div key={track.type} className="flex items-center">
                      <div className="w-20 text-xs font-medium pr-2 flex-shrink-0">{track.label}</div>
                      <div className="flex-1 h-10 relative bg-zinc-800/50 rounded" data-track={track.type}>
                        {getClipsByTrack(track.type as Clip["type"]).map((clip) => {
                          const clipStyle = {
                            left: `${(clip.start / (duration || 1)) * 100}%`,
                            width: `${((clip.end - clip.start) / (duration || 1)) * 100}%`,
                            backgroundColor: clip.color,
                          }

                          const isSelected = selectedClip === clip.id
                          const isActiveVideo = clip.type === "video" && clip.src === activeVideo

                          return (
                            <div
                              key={`${track.type}-${clip.id}`}
                              className={cn(
                                "absolute top-0 h-full rounded cursor-pointer flex items-center px-2 text-xs font-medium group",
                                isSelected ? "ring-2 ring-white" : "",
                                isActiveVideo ? "ring-1 ring-primary" : "",
                              )}
                              style={clipStyle}
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedClip(clip.id)

                                // If it's a video clip, switch to that video
                                if (clip.type === "video") {
                                  switchActiveVideo(clip.id)
                                } else if (clip.type === "text") {
                                  setSelectedTextId(clip.id)
                                  setSelectedTool("text")
                                } else if (clip.type === "image") {
                                  setSelectedImageId(clip.id)
                                  setSelectedTool("overlays")
                                }
                              }}
                            >
                              <div className="flex-1 truncate">{clip.name}</div>

                              {/* Trim handles for all clip types */}
                              {isSelected && (
                                <>
                                  {/* Left trim handle */}
                                  <div
                                    className="absolute left-0 top-0 bottom-0 w-2 bg-white cursor-ew-resize"
                                    onMouseDown={(e) => {
                                      e.stopPropagation()

                                      // Setup drag handling for left trim
                                      const handleMouseMove = (moveEvent: MouseEvent) => {
                                        if (!timelineRef.current || !duration) return

                                        const rect = timelineRef.current.getBoundingClientRect()
                                        const position = moveEvent.clientX - rect.left
                                        const timelineWidth = rect.width
                                        const percentage = Math.max(
                                          0,
                                          Math.min(position / rect.width, clip.end / duration - 0.01),
                                        )
                                        const newStart = percentage * duration

                                        updateClipTrim(clip.id, newStart, clip.end)
                                      }

                                      const handleMouseUp = () => {
                                        document.removeEventListener("mousemove", handleMouseMove)
                                        document.removeEventListener("mouseup", handleMouseUp)
                                      }

                                      document.addEventListener("mousemove", handleMouseMove)
                                      document.addEventListener("mouseup", handleMouseUp)
                                    }}
                                  />

                                  {/* Right trim handle */}
                                  <div
                                    className="absolute right-0 top-0 bottom-0 w-2 bg-white cursor-ew-resize"
                                    onMouseDown={(e) => {
                                      e.stopPropagation()

                                      // Setup drag handling for right trim
                                      const handleMouseMove = (moveEvent: MouseEvent) => {
                                        if (!timelineRef.current || !duration) return

                                        const rect = timelineRef.current.getBoundingClientRect()
                                        const position = moveEvent.clientX - rect.left
                                        const timelineWidth = rect.width
                                        const percentage = Math.max(
                                          clip.start / duration + 0.01,
                                          Math.min(position / rect.width, 1),
                                        )
                                        const newEnd = percentage * duration

                                        updateClipTrim(clip.id, clip.start, newEnd)
                                      }

                                      const handleMouseUp = () => {
                                        document.removeEventListener("mousemove", handleMouseMove)
                                        document.removeEventListener("mouseup", handleMouseUp)
                                      }

                                      document.addEventListener("mousemove", handleMouseMove)
                                      document.addEventListener("mouseup", handleMouseUp)
                                    }}
                                  />
                                </>
                              )}

                              {/* Delete button for all clip types */}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteClip(clip.id)
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          )
                        })}

                        {/* Current time indicator */}
                        <div
                          className="absolute top-0 h-full w-0.5 bg-white z-10 cursor-ew-resize transition-all duration-100 ease-linear"
                          style={{ left: `${(currentTime / (duration || 1)) * 100}%` }}
                          onMouseDown={handlePlayheadDrag}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-32 text-slate-400 py-8">
                  <div className="bg-slate-800/80 p-3 rounded-full mb-3">
                    <Video className="h-6 w-6 text-slate-500" />
                  </div>
                  <p>Import a video to start editing</p>
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        {/* Right Sidebar - Properties */}
        <div className="w-72 border-l border-slate-800/70 bg-slate-900/50 backdrop-blur-sm flex flex-col">
          <Tabs defaultValue="properties" className="flex flex-col h-full">
            <TabsList className="w-full">
              <TabsTrigger value="properties" className="flex-1">
                Properties
              </TabsTrigger>
              <TabsTrigger value="library" className="flex-1">
                Library
              </TabsTrigger>
            </TabsList>

            {/* Properties Tab */}
            <TabsContent
              value="properties"
              className="flex-1 overflow-hidden m-0 p-0 data-[state=active]:flex data-[state=active]:flex-col"
            >
              <div className="p-4">
                <h3 className="font-medium mb-4">
                  {selectedClipData
                    ? selectedClipData.name
                    : activeVideo
                      ? "Select a clip to edit"
                      : "Import a video to start"}
                </h3>
              </div>

              {selectedClipData ? (
                <ScrollArea className="flex-1">
                  <div className="px-4 pb-4 space-y-4">
                    {selectedClipData.type === "text" && (
                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant={selectedTextData?.style.bold ? "default" : "outline"}
                            size="icon"
                            onClick={() => handleTextStyleChange("bold", !selectedTextData?.style.bold)}
                          >
                            <Bold className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={selectedTextData?.style.italic ? "default" : "outline"}
                            size="icon"
                            onClick={() => handleTextStyleChange("italic", !selectedTextData?.style.italic)}
                          >
                            <Italic className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={selectedTextData?.style.underline ? "default" : "outline"}
                            size="icon"
                            onClick={() => handleTextStyleChange("underline", !selectedTextData?.style.underline)}
                          >
                            <Underline className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="icon">
                                {selectedTextData?.style.align === "left" && <AlignLeft className="h-4 w-4" />}
                                {selectedTextData?.style.align === "center" && <AlignCenter className="h-4 w-4" />}
                                {selectedTextData?.style.align === "right" && <AlignRight className="h-4 w-4" />}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => handleTextStyleChange("align", "left")}>
                                <AlignLeft className="h-4 w-4 mr-2" /> Left
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleTextStyleChange("align", "center")}>
                                <AlignCenter className="h-4 w-4 mr-2" /> Center
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleTextStyleChange("align", "right")}>
                                <AlignRight className="h-4 w-4 mr-2" /> Right
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs text-zinc-400">Font Size</label>
                          <Slider
                            value={[selectedTextData?.style.fontSize || 24]}
                            min={12}
                            max={72}
                            step={1}
                            onValueChange={(value) => handleTextStyleChange("fontSize", value[0])}
                          />
                          <div className="flex justify-between text-xs text-zinc-500">
                            <span>12px</span>
                            <span>72px</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs text-zinc-400">Color</label>
                          <div className="grid grid-cols-8 gap-1 mb-2">
                            {[
                              "#ffffff",
                              "#000000",
                              "#ff0000",
                              "#ff69b4",
                              "#800080",
                              "#ffa500",
                              "#ffff00",
                              "#00ff00",
                              "#00ffff",
                              "#0000ff",
                              "#8a2be2",
                              "#a52a2a",
                              "#d2691e",
                              "#daa520",
                              "#808080",
                              "#f0f8ff",
                              "#e6e6fa",
                              "#ffe4e1",
                            ].map((color) => (
                              <button
                                key={color}
                                className={cn(
                                  "h-6 w-6 rounded border border-zinc-600 transition-all hover:scale-110",
                                  selectedTextData?.style.color === color ? "ring-2 ring-white" : "",
                                )}
                                style={{ backgroundColor: color }}
                                onClick={() => handleTextStyleChange("color", color)}
                                aria-label={`Select color ${color}`}
                              />
                            ))}
                          </div>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-8 h-8 rounded border border-zinc-700 flex-shrink-0"
                              style={{ backgroundColor: selectedTextData?.style.color || "#ffffff" }}
                            />
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-between">
                                  {selectedTextData?.style.color || "#FFFFFF"}
                                  <span className="sr-only">Open color picker</span>
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-64 p-3">
                                <ColorPicker
                                  color={selectedTextData?.style.color || "#FFFFFF"}
                                  onChange={(color) => handleTextStyleChange("color", color)}
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs text-zinc-400">Duration</label>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-zinc-500" />
                            <div className="flex items-center gap-2 w-full">
                              <input
                                type="text"
                                value={formatTime(selectedClipData.start)}
                                onChange={(e) => {
                                  const timeParts = e.target.value.split(":")
                                  if (timeParts.length === 2) {
                                    const minutes = Number.parseInt(timeParts[0])
                                    const seconds = Number.parseInt(timeParts[1])
                                    if (!isNaN(minutes) && !isNaN(seconds)) {
                                      const newStart = minutes * 60 + seconds
                                      if (newStart < selectedClipData.end) {
                                        updateClipTrim(selectedClipData.id, newStart, selectedClipData.end)
                                      }
                                    }
                                  }
                                }}
                                className="bg-zinc-800 border border-zinc-700 rounded p-2 text-sm w-full"
                              />
                              <Slash className="h-4 w-4 text-zinc-500" />
                              <input
                                type="text"
                                value={formatTime(selectedClipData.end)}
                                onChange={(e) => {
                                  const timeParts = e.target.value.split(":")
                                  if (timeParts.length === 2) {
                                    const minutes = Number.parseInt(timeParts[0])
                                    const seconds = Number.parseInt(timeParts[1])
                                    if (!isNaN(minutes) && !isNaN(seconds)) {
                                      const newEnd = minutes * 60 + seconds
                                      if (newEnd > selectedClipData.start && newEnd <= duration) {
                                        updateClipTrim(selectedClipData.id, selectedClipData.start, newEnd)
                                      }
                                    }
                                  }
                                }}
                                className="bg-zinc-800 border border-zinc-700 rounded p-2 text-sm w-full"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedClipData.type === "effect" && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs text-zinc-400">Effect Type</label>
                          <div className="bg-zinc-800 border border-zinc-700 rounded p-2 text-sm">
                            {selectedClipData.effectName || "Unknown Effect"}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs text-zinc-400">Duration</label>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-zinc-500" />
                            <div className="flex items-center gap-2 w-full">
                              <input
                                type="text"
                                value={formatTime(selectedClipData.start)}
                                onChange={(e) => {
                                  const timeParts = e.target.value.split(":")
                                  if (timeParts.length === 2) {
                                    const minutes = Number.parseInt(timeParts[0])
                                    const seconds = Number.parseInt(timeParts[1])
                                    if (!isNaN(minutes) && !isNaN(seconds)) {
                                      const newStart = minutes * 60 + seconds
                                      if (newStart < selectedClipData.end) {
                                        updateClipTrim(selectedClipData.id, newStart, selectedClipData.end)
                                      }
                                    }
                                  }
                                }}
                                className="bg-zinc-800 border border-zinc-700 rounded p-2 text-sm w-full"
                              />
                              <Slash className="h-4 w-4 text-zinc-500" />
                              <input
                                type="text"
                                value={formatTime(selectedClipData.end)}
                                onChange={(e) => {
                                  const timeParts = e.target.value.split(":")
                                  if (timeParts.length === 2) {
                                    const minutes = Number.parseInt(timeParts[0])
                                    const seconds = Number.parseInt(timeParts[1])
                                    if (!isNaN(minutes) && !isNaN(seconds)) {
                                      const newEnd = minutes * 60 + seconds
                                      if (newEnd > selectedClipData.start && newEnd <= duration) {
                                        updateClipTrim(selectedClipData.id, selectedClipData.start, newEnd)
                                      }
                                    }
                                  }
                                }}
                                className="bg-zinc-800 border border-zinc-700 rounded p-2 text-sm w-full"
                              />
                            </div>
                          </div>
                        </div>

                        <p className="text-xs text-zinc-500 italic">
                          Drag the edges of the effect clip in the timeline to adjust when it appears.
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center px-4">
                  <Square className="h-12 w-12 opacity-20 mb-2" />
                  <p className="text-center text-zinc-500">
                    {activeVideo ? "Select a clip to edit its properties" : "Import a video to start editing"}
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Library Tab */}
            <TabsContent
              value="library"
              className="flex-1 overflow-hidden m-0 p-0 data-[state=active]:flex data-[state=active]:flex-col"
            >
              <div className="p-4">
                <h3 className="font-medium mb-2">Media Library</h3>
              </div>
              <ScrollArea className="flex-1">
                <div className="px-4 pb-4 space-y-6">
                  {/* Effects Section */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center text-sm">
                      <Film className="h-4 w-4 mr-2" />
                      Effects
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {effects.map((effect) => (
                        <div key={effect.id} className="cursor-pointer group">
                          <div className="aspect-video bg-zinc-800 rounded overflow-hidden relative">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-sm font-medium">{effect.name}</div>
                            </div>
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => applyEffect(effect.name)}
                                disabled={!activeVideo}
                              >
                                Add
                              </Button>
                            </div>
                          </div>
                          <p className="text-xs mt-1">{effect.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Filters Section */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center text-sm">
                      <Layers className="h-4 w-4 mr-2" />
                      Filters
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {filters.map((filter) => (
                        <div key={filter.name} className="cursor-pointer group">
                          <div
                            className={cn(
                              "aspect-video bg-zinc-800 rounded overflow-hidden relative",
                              activeFilter === filter.name ? "ring-2 ring-primary" : "",
                            )}
                          >
                            <div
                              className="absolute inset-0 flex items-center justify-center text-center p-2"
                              style={{ filter: filter.filter }}
                            >
                              <div className="text-xs font-medium">{filter.name}</div>
                            </div>
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => applyFilter(filter.name)}
                                disabled={!activeVideo}
                              >
                                Apply
                              </Button>
                            </div>
                          </div>
                          <p className="text-xs mt-1">{filter.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Text Styles Section */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center text-sm">
                      <Text className="h-4 w-4 mr-2" />
                      Text Styles
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {textStyles.map((style) => (
                        <div key={style.name} className="cursor-pointer group">
                          <div className="aspect-video bg-zinc-800 rounded overflow-hidden relative">
                            <div className="absolute inset-0 flex items-center justify-center text-center p-2">
                              <div
                                className="text-xs"
                                style={{
                                  fontWeight: style.style.bold ? "bold" : "normal",
                                  fontStyle: style.style.italic ? "italic" : "normal",
                                  textDecoration: style.style.underline ? "underline" : "none",
                                  textAlign: style.style.align,
                                  fontSize: `${style.style.fontSize ? style.style.fontSize / 2 : 12}px`,
                                  color: style.style.color || "white",
                                }}
                              >
                                {style.name}
                              </div>
                            </div>
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => applyTextStyle(style.style)}
                                disabled={!selectedTextId}
                              >
                                Apply
                              </Button>
                            </div>
                          </div>
                          <p className="text-xs mt-1">{style.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
