"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Download } from "lucide-react"

export function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isMac, setIsMac] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return

    // Check if it's iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    setIsIOS(isIOSDevice)

    // Check if it's macOS
    const isMacOS = /Mac/.test(navigator.userAgent) && !isIOSDevice
    setIsMac(isMacOS)

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault()
      // Stash the event so it can be triggered later
      setDeferredPrompt(e)
      // Show our custom install prompt
      setShowPrompt(true)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    // If it's iOS or Mac and the app is not in standalone mode, show the prompt
    if ((isIOSDevice || isMacOS) && !window.matchMedia("(display-mode: standalone)").matches) {
      // Wait a bit before showing the prompt
      const timer = setTimeout(() => {
        setShowPrompt(true)
      }, 3000)

      return () => {
        clearTimeout(timer)
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      }
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Show the install prompt
      deferredPrompt.prompt()
      // Wait for the user to respond to the prompt
      try {
        const { outcome } = await deferredPrompt.userChoice
        console.log(`User response to the install prompt: ${outcome}`)
      } catch (error) {
        console.error("Error with install prompt:", error)
      }
      // Clear the saved prompt since it can't be used again
      setDeferredPrompt(null)
      // Hide our custom install prompt
      setShowPrompt(false)
    }
  }

  const closePrompt = () => {
    setShowPrompt(false)
  }

  if (!showPrompt) return null

  return (
    <Dialog open={showPrompt} onOpenChange={setShowPrompt}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Install Trendify</DialogTitle>
          <DialogDescription>
            {isIOS
              ? "Install Trendify on your iOS device for the best experience."
              : isMac
                ? "Install Trendify on your Mac for the best experience."
                : "Install Trendify for the best experience."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {isIOS ? (
            <div className="space-y-2">
              <p className="text-sm">To install on iOS:</p>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>
                  Tap the share button{" "}
                  <span className="inline-block px-2 py-1 bg-gray-200 dark:bg-gray-800 rounded">Share</span> at the
                  bottom of the screen
                </li>
                <li>
                  Scroll down and tap <span className="font-medium">Add to Home Screen</span>
                </li>
                <li>
                  Tap <span className="font-medium">Add</span> in the top right corner
                </li>
              </ol>
            </div>
          ) : isMac ? (
            <div className="space-y-2">
              <p className="text-sm">To install on macOS (Chrome or Edge):</p>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>
                  Click the install icon{" "}
                  <span className="inline-block px-2 py-1 bg-gray-200 dark:bg-gray-800 rounded">+</span> in the address
                  bar
                </li>
                <li>
                  Click <span className="font-medium">Install</span> in the prompt
                </li>
              </ol>
              <p className="text-sm mt-4">To install on macOS (Safari):</p>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>
                  Click <span className="font-medium">File</span> in the menu bar
                </li>
                <li>
                  Select <span className="font-medium">Add to Dock...</span>
                </li>
                <li>
                  Click <span className="font-medium">Add</span>
                </li>
              </ol>
            </div>
          ) : (
            <Button onClick={handleInstallClick} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Install Trendify
            </Button>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={closePrompt}>
            Maybe Later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
