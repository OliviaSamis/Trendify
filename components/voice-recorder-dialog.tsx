"use client"

import { useState, useRef, useEffect } from "react"
import { Mic, Square, Play, Pause, Save, Trash2, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"

interface VoiceRecorderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (audioBlob: Blob, duration: number) => void
}

export function VoiceRecorderDialog({ open, onOpenChange, onSave }: VoiceRecorderDialogProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(80)
  const [error, setError] = useState<string | null>(null)
  const [visualizerData, setVisualizerData] = useState<number[]>(Array(50).fill(0))

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Start recording
  const startRecording = async () => {
    try {
      setError(null)
      audioChunksRef.current = []

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      // Set up audio context and analyser for visualization
      const audioContext = new AudioContext()
      audioContextRef.current = audioContext
      const analyser = audioContext.createAnalyser()
      analyserRef.current = analyser
      analyser.fftSize = 256

      const source = audioContext.createMediaStreamSource(stream)
      sourceRef.current = source
      source.connect(analyser)

      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        setAudioBlob(audioBlob)
        setDuration(recordingTime)

        // Clean up stream tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop())
        }
      }

      // Start recording
      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)

      // Start visualizer
      drawVisualizer()
    } catch (err) {
      console.error("Error starting recording:", err)
      setError("Could not access microphone. Please check permissions and try again.")
    }
  }

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
    }

    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    // Stop visualizer
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    setIsRecording(false)
  }

  // Draw audio visualizer
  const drawVisualizer = () => {
    if (!analyserRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const analyser = analyserRef.current
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      if (!analyserRef.current || !canvasRef.current || !ctx) return

      animationFrameRef.current = requestAnimationFrame(draw)
      analyser.getByteFrequencyData(dataArray)

      // Process data for visualization
      const processedData = Array.from(dataArray)
        .filter((_, i) => i % 4 === 0) // Take every 4th value to reduce data points
        .slice(0, 50) // Limit to 50 bars

      setVisualizerData(processedData)

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw visualization
      const barWidth = canvas.width / processedData.length
      const barGap = 2

      processedData.forEach((value, i) => {
        const barHeight = (value / 255) * canvas.height * 0.8

        // Create gradient
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0)
        gradient.addColorStop(0, "#3b82f6") // Blue
        gradient.addColorStop(1, "#8b5cf6") // Purple

        ctx.fillStyle = gradient
        ctx.fillRect(i * (barWidth + barGap), canvas.height - barHeight, barWidth, barHeight)
      })
    }

    draw()
  }

  // Play/pause recorded audio
  const togglePlayback = () => {
    if (!audioRef.current || !audioBlob) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  // Handle audio time update
  const handleTimeUpdate = () => {
    if (!audioRef.current) return
    setCurrentTime(audioRef.current.currentTime)
  }

  // Handle audio ended
  const handleAudioEnded = () => {
    setIsPlaying(false)
    setCurrentTime(0)
    if (audioRef.current) {
      audioRef.current.currentTime = 0
    }
  }

  // Handle seeking
  const handleSeek = (value: number) => {
    if (!audioRef.current) return
    audioRef.current.currentTime = value
    setCurrentTime(value)
  }

  // Handle volume change
  const handleVolumeChange = (value: number) => {
    setVolume(value)
    if (audioRef.current) {
      audioRef.current.volume = value / 100
    }
  }

  // Reset recording
  const resetRecording = () => {
    setAudioBlob(null)
    setIsPlaying(false)
    setCurrentTime(0)
    setDuration(0)
    setRecordingTime(0)
  }

  // Save recording
  const handleSave = () => {
    if (!audioBlob) return
    onSave(audioBlob, duration)
    onOpenChange(false)
    resetRecording()
  }

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }

      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close()
      }
    }
  }, [])

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      if (isRecording) {
        stopRecording()
      }

      // Don't reset the recording when closing the dialog
      // This allows the user to reopen and continue working with the recording
    }
  }, [open, isRecording])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle>Add Voice Over</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col space-y-4">
          {/* Audio visualizer */}
          <div className="relative h-24 bg-gray-800 rounded-md overflow-hidden">
            {isRecording ? (
              <canvas ref={canvasRef} className="w-full h-full" width={400} height={100} />
            ) : audioBlob ? (
              <div className="flex items-center justify-center h-full">
                <div className="flex space-x-1">
                  {visualizerData.map((value, index) => (
                    <div
                      key={index}
                      className="w-1 bg-gradient-to-t from-blue-600 to-indigo-500 rounded-full"
                      style={{
                        height: `${Math.max(15, (value / 255) * 80)}%`,
                        opacity: isPlaying ? 0.8 : 0.4,
                      }}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500">
                <p>Ready to record</p>
              </div>
            )}

            {/* Recording indicator */}
            {isRecording && (
              <div className="absolute top-2 right-2 flex items-center">
                <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse mr-1" />
                <span className="text-xs text-red-400">{formatTime(recordingTime)}</span>
              </div>
            )}
          </div>

          {/* Error message */}
          {error && <div className="text-red-500 text-sm p-2 bg-red-100/10 rounded">{error}</div>}

          {/* Audio player (hidden) */}
          {audioBlob && (
            <audio
              ref={audioRef}
              src={URL.createObjectURL(audioBlob)}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleAudioEnded}
              className="hidden"
            />
          )}

          {/* Playback controls */}
          {audioBlob ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="icon" onClick={togglePlayback}>
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <div className="flex-1">
                  <Slider
                    value={[currentTime]}
                    max={duration}
                    step={0.1}
                    onValueChange={(value) => handleSeek(value[0])}
                  />
                </div>
                <div className="text-xs text-slate-400 w-16 text-right">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Volume2 className="h-4 w-4 text-slate-400" />
                <Slider value={[volume]} max={100} step={1} onValueChange={(value) => handleVolumeChange(value[0])} />
              </div>

              <div className="flex justify-between pt-2">
                <Button variant="outline" size="sm" onClick={resetRecording}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Discard
                </Button>
                <Button size="sm" onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Add to Timeline
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex justify-center pt-2">
              <Button
                variant={isRecording ? "destructive" : "default"}
                size="lg"
                className={isRecording ? "animate-pulse" : ""}
                onClick={isRecording ? stopRecording : startRecording}
              >
                {isRecording ? (
                  <>
                    <Square className="h-4 w-4 mr-2" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4 mr-2" />
                    Start Recording
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          <p className="text-xs text-slate-500">
            {audioBlob ? "Preview your voice over before adding to timeline" : "Record a voice over for your video"}
          </p>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
