"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus, Video } from "lucide-react"

export default function LibraryPage() {
  const router = useRouter()
  const [videos, setVideos] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load saved videos from localStorage
  useEffect(() => {
    try {
      const savedVideos = localStorage.getItem("trendify_videos")
      if (savedVideos) {
        setVideos(JSON.parse(savedVideos))
      }
    } catch (error) {
      console.error("Error loading saved videos:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Create a new video
  const handleCreateNew = () => {
    router.push("/")
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-900">
        <div className="w-16 h-16 border-4 border-zinc-600 border-t-primary rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Your Videos</h1>
          <Button onClick={handleCreateNew} className="gap-2">
            <Plus className="h-4 w-4" />
            Create New Video
          </Button>
        </header>

        {videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Video className="h-16 w-16 text-zinc-700 mb-4" />
            <h2 className="text-xl font-medium mb-2">No videos yet</h2>
            <p className="text-zinc-400 mb-6 max-w-md">
              Create your first video by clicking the button below. You'll be able to customize it for your preferred
              platform.
            </p>
            <Button onClick={handleCreateNew} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Your First Video
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video, index) => (
              <div key={index} className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                <h3 className="font-medium mb-2">{video.title || "Untitled Video"}</h3>
                <div className="text-sm text-zinc-400">
                  {video.platform} • {video.niche} • {video.trend}
                </div>
                <div className="mt-4 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      router.push(
                        `/editor?id=${video.id}&platform=${encodeURIComponent(video.platform)}&niche=${encodeURIComponent(video.niche)}&trend=${encodeURIComponent(video.trend)}`,
                      )
                    }
                  >
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
