"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Edit, Trash2, Video } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type SavedVideo = {
  id: string
  title: string
  platform: string
  niche: string
  trend: string
  thumbnail: string
  dateCreated: string
  duration: string
}

export function VideoLibrary() {
  const router = useRouter()
  const [videos, setVideos] = useState<SavedVideo[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [videoToDelete, setVideoToDelete] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load saved videos from localStorage
  useEffect(() => {
    const loadVideos = () => {
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
    }

    // Simulate loading delay
    setTimeout(loadVideos, 500)
  }, [])

  // Create a new video
  const handleCreateNew = () => {
    router.push("/")
  }

  // Edit an existing video
  const handleEditVideo = (video: SavedVideo) => {
    router.push(
      `/editor?id=${video.id}&platform=${encodeURIComponent(video.platform)}&niche=${encodeURIComponent(video.niche)}&trend=${encodeURIComponent(video.trend)}`,
    )
  }

  // Delete a video
  const handleDeleteVideo = (id: string) => {
    setVideoToDelete(id)
    setDeleteDialogOpen(true)
  }

  // Confirm video deletion
  const confirmDelete = () => {
    if (videoToDelete) {
      const updatedVideos = videos.filter((video) => video.id !== videoToDelete)
      setVideos(updatedVideos)

      try {
        localStorage.setItem("trendify_videos", JSON.stringify(updatedVideos))
      } catch (error) {
        console.error("Error saving videos:", error)
      }

      setDeleteDialogOpen(false)
      setVideoToDelete(null)
    }
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
            {videos.map((video) => (
              <Card key={video.id} className="bg-zinc-800 border-zinc-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{video.title}</CardTitle>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="aspect-video bg-zinc-900 rounded-md overflow-hidden mb-3">
                    {video.thumbnail ? (
                      <img
                        src={video.thumbnail || "/placeholder.svg"}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Video className="h-10 w-10 text-zinc-700" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-zinc-400">
                    <span className="px-2 py-1 bg-zinc-700 rounded-full">{video.platform}</span>
                    <span className="px-2 py-1 bg-zinc-700 rounded-full">{video.niche}</span>
                    <span className="px-2 py-1 bg-zinc-700 rounded-full">{video.trend}</span>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-2">
                  <div className="text-xs text-zinc-400">
                    {video.dateCreated} • {video.duration}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteVideo(video.id)}>
                      <Trash2 className="h-4 w-4 text-zinc-400" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleEditVideo(video)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Video</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this video? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
