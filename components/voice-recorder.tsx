"use client"

import { useState, useRef, useEffect } from "react"
import { Mic, Square, Play, Pause, Save, Trash2, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

interface VoiceRecorderProps {
  onSave: (audioBlob: Blob, duration: number) => void
  onCancel: () => void
  className?: string
}

export function VoiceRecorder({ onSave, onCancel, className }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackTime, setPlaybackTime] = useState(0)
  const [volume, setVolume] = useState(80)
  const [isMuted, setIsMuted] = useState(false)
  const [audioVisualization, setAudioVisualization] = useState<number[]>([])
  const [recordingError, setRecordingError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioStreamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null)
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)
  const playbackTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize audio player when blob is available
  useEffect(() => {
    if (audioBlob && audioPlayerRef.current) {
      const audioUrl = URL.createObjectURL(audioBlob)
      audioPlayerRef.current.src = audioUrl
      audioPlayerRef.current.volume = volume / 100

      return () => {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioBlob, volume])

  // Handle volume changes
  useEffect(() => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.volume = isMuted ? 0 : volume / 100
    }
  }, [volume, isMuted])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
      }
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current)
      }
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((track) => track.stop())
      }
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close()
      }
    }
  }, [])

  // Start recording
  const startRecording = async () => {
    try {
      setRecordingError(null)
      audioChunksRef.current = []
      setAudioBlob(null)
      setPlaybackTime(0)
      setRecordingTime(0)
      setAudioVisualization([])

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioStreamRef.current = stream

      // Set up audio context and analyzer for visualization
      const audioContext = new AudioContext()
      audioContextRef.current = audioContext
      const analyser = audioContext.createAnalyser()
      analyserRef.current = analyser
      analyser.fftSize = 256

      const source = audioContext.createMediaStreamSource(stream)
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

        if (audioStreamRef.current) {
          audioStreamRef.current.getTracks().forEach((track) => track.stop())
        }
      }

      // Start recording
      mediaRecorder.start(100)
      setIsRecording(true)

      // Start timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)

        // Update visualization
        if (analyserRef.current) {
          const dataArray = new Uint8Array(analyser.frequencyBinCount)
          analyser.getByteFrequencyData(dataArray)

          // Sample the data to get a reasonable number of bars
          const sampleSize = Math.floor(dataArray.length / 20)
          const sampledData = []

          for (let i = 0; i < 20; i++) {
            let sum = 0
            for (let j = 0; j < sampleSize; j++) {
              sum += dataArray[i * sampleSize + j]
            }
            sampledData.push(Math.floor(sum / sampleSize))
          }

          setAudioVisualization(sampledData)
        }
      }, 1000)
    } catch (error) {
      console.error("Error starting recording:", error)
      setRecordingError("Could not access microphone. Please check permissions.")
    }
  }

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
        recordingTimerRef.current = null
      }

      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }

  // Play recorded audio
  const playAudio = () => {
    if (audioPlayerRef.current && audioBlob) {
      audioPlayerRef.current.play()
      setIsPlaying(true)

      // Update playback time
      playbackTimerRef.current = setInterval(() => {
        if (audioPlayerRef.current) {
          setPlaybackTime(audioPlayerRef.current.currentTime)
        }
      }, 100)
    }
  }

  // Pause playback
  const pauseAudio = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause()
      setIsPlaying(false)

      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current)
        playbackTimerRef.current = null
      }
    }
  }

  // Seek to position
  const seekAudio = (time: number) => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.currentTime = time
      setPlaybackTime(time)
    }
  }

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Handle audio ended
  const handleAudioEnded = () => {
    setIsPlaying(false)
    setPlaybackTime(0)

    if (playbackTimerRef.current) {
      clearInterval(playbackTimerRef.current)
      playbackTimerRef.current = null
    }
  }

  // Save the recording
  const handleSave = () => {
    if (audioBlob && audioPlayerRef.current) {
      onSave(audioBlob, audioPlayerRef.current.duration)
    }
  }

  return (
    <div className={cn("p-4 bg-slate-800 rounded-lg border border-slate-700", className)}>
      <h3 className="text-lg font-medium mb-4">Voice Recorder</h3>

      {recordingError && (
        <div className="bg-red-900/30 border border-red-800 text-red-200 p-3 rounded-md mb-4 text-sm">
          {recordingError}
        </div>
      )}

      {/* Recording visualization */}
      <div className="h-20 bg-slate-900 rounded-md mb-4 flex items-end justify-center gap-1 p-2 overflow-hidden">
        {isRecording ? (
          // Live visualization during recording
          audioVisualization.map((value, index) => (
            <div
              key={index}
              className="w-2 bg-gradient-to-t from-purple-500 to-pink-500 rounded-sm"
              style={{ height: `${Math.max(4, value / 2)}%` }}
            />
          ))
        ) : audioBlob ? (
          // Waveform representation for recorded audio
          Array.from({ length: 40 }).map((_, index) => (
            <div
              key={index}
              className="w-2 bg-gradient-to-t from-purple-500 to-pink-500 rounded-sm"
              style={{
                height: `${20 + Math.sin(index / 2) * 15 + Math.random() * 15}%`,
                opacity: playbackTime > 0 ? 0.5 + (index / 40) * 0.5 : 0.5,
              }}
            />
          ))
        ) : (
          // Empty state
          <div className="text-slate-500 text-sm flex items-center justify-center w-full h-full">
            Press record to start
          </div>
        )}
      </div>

      {/* Timer display */}
      <div className="text-center mb-4 font-mono text-lg">
        {isRecording ? (
          <div className="text-red-500 flex items-center justify-center gap-2">
            <span className="animate-pulse">●</span> {formatTime(recordingTime)}
          </div>
        ) : audioBlob ? (
          <div>
            {formatTime(playbackTime)} / {formatTime(audioPlayerRef.current?.duration || 0)}
          </div>
        ) : (
          <div>00:00</div>
        )}
      </div>

      {/* Audio player (hidden) */}
      <audio
        ref={audioPlayerRef}
        onEnded={handleAudioEnded}
        onTimeUpdate={() => audioPlayerRef.current && setPlaybackTime(audioPlayerRef.current.currentTime)}
        className="hidden"
      />

      {/* Playback controls */}
      {audioBlob && !isRecording && (
        <div className="mb-4">
          <Slider
            value={[playbackTime]}
            max={audioPlayerRef.current?.duration || 1}
            step={0.1}
            onValueChange={(value) => seekAudio(value[0])}
            className="mb-4"
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={isPlaying ? pauseAudio : playAudio}
                className="bg-slate-700 hover:bg-slate-600"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => setIsMuted(!isMuted)}>
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              <Slider
                value={[volume]}
                max={100}
                step={1}
                onValueChange={(value) => setVolume(value[0])}
                className="w-24"
              />
            </div>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex justify-between gap-2 mt-4">
        {isRecording ? (
          <Button variant="destructive" onClick={stopRecording} className="flex-1">
            <Square className="h-4 w-4 mr-2" /> Stop Recording
          </Button>
        ) : audioBlob ? (
          <>
            <Button variant="outline" onClick={onCancel}>
              <Trash2 className="h-4 w-4 mr-2" /> Discard
            </Button>
            <Button
              variant="default"
              onClick={handleSave}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <Save className="h-4 w-4 mr-2" /> Add to Timeline
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              onClick={startRecording}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <Mic className="h-4 w-4 mr-2" /> Start Recording
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
