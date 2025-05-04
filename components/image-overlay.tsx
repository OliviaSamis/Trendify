"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { X, Maximize2 } from "lucide-react"

interface ImageOverlayProps {
  src: string
  position: { x: number; y: number }
  size: { width: number; height: number }
  onPositionChange: (position: { x: number; y: number }) => void
  onSizeChange: (size: { width: number; height: number }) => void
  onDelete: () => void
  isSelected: boolean
  type: "image" | "pdf"
  pdfPage?: number
  onPageChange?: (page: number) => void
  totalPages?: number
}

export function ImageOverlay({
  src,
  position,
  size,
  onPositionChange,
  onSizeChange,
  onDelete,
  isSelected,
  type,
  pdfPage = 1,
  onPageChange,
  totalPages = 1,
}: ImageOverlayProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const overlayRef = useRef<HTMLDivElement>(null)

  const handleDragStart = (e: React.MouseEvent) => {
    if (!overlayRef.current) return

    setIsDragging(true)
    const rect = overlayRef.current.getBoundingClientRect()
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  const handleDragMove = (e: MouseEvent) => {
    if (!isDragging || !overlayRef.current) return

    const parentRect = overlayRef.current.parentElement?.getBoundingClientRect()
    if (!parentRect) return

    // Calculate new position relative to parent
    const newX = Math.max(
      0,
      Math.min(e.clientX - parentRect.left - dragOffset.x, parentRect.width - overlayRef.current.offsetWidth),
    )
    const newY = Math.max(
      0,
      Math.min(e.clientY - parentRect.top - dragOffset.y, parentRect.height - overlayRef.current.offsetHeight),
    )

    onPositionChange({ x: newX, y: newY })
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!overlayRef.current) return

    setIsResizing(true)
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
    })
  }

  const handleResizeMove = (e: MouseEvent) => {
    if (!isResizing) return

    const deltaX = e.clientX - resizeStart.x
    const deltaY = e.clientY - resizeStart.y

    // Maintain aspect ratio if shift is pressed
    if (e.shiftKey) {
      const aspectRatio = resizeStart.width / resizeStart.height
      const newWidth = Math.max(50, resizeStart.width + deltaX)
      const newHeight = newWidth / aspectRatio
      onSizeChange({ width: newWidth, height: newHeight })
    } else {
      onSizeChange({
        width: Math.max(50, resizeStart.width + deltaX),
        height: Math.max(50, resizeStart.height + deltaY),
      })
    }
  }

  const handleResizeEnd = () => {
    setIsResizing(false)
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete()
  }

  const handleNextPage = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onPageChange && pdfPage < (totalPages || 1)) {
      onPageChange(pdfPage + 1)
    }
  }

  const handlePrevPage = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onPageChange && pdfPage > 1) {
      onPageChange(pdfPage - 1)
    }
  }

  // Add and remove event listeners for drag and resize
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleDragMove)
      window.addEventListener("mouseup", handleDragEnd)
    }

    if (isResizing) {
      window.addEventListener("mousemove", handleResizeMove)
      window.addEventListener("mouseup", handleResizeEnd)
    }

    return () => {
      window.removeEventListener("mousemove", handleDragMove)
      window.removeEventListener("mouseup", handleDragEnd)
      window.removeEventListener("mousemove", handleResizeMove)
      window.removeEventListener("mouseup", handleResizeEnd)
    }
  }, [isDragging, isResizing])

  return (
    <div
      ref={overlayRef}
      className={cn("absolute cursor-move", isSelected && "outline outline-2 outline-primary")}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        zIndex: 10,
      }}
      onMouseDown={handleDragStart}
    >
      <div className="relative w-full h-full">
        {type === "image" ? (
          <img src={src || "/placeholder.svg"} alt="Overlay" className="w-full h-full object-contain" />
        ) : (
          <div className="w-full h-full flex flex-col">
            <div className="bg-slate-800 text-white text-xs p-1 flex justify-between">
              <span>
                PDF Page {pdfPage}/{totalPages}
              </span>
              <div className="flex gap-1">
                <button onClick={handlePrevPage} disabled={pdfPage <= 1} className="px-1 disabled:opacity-50">
                  ←
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={pdfPage >= (totalPages || 1)}
                  className="px-1 disabled:opacity-50"
                >
                  →
                </button>
              </div>
            </div>
            <iframe src={`${src}#page=${pdfPage}`} className="w-full flex-1 bg-white" title="PDF Preview" />
          </div>
        )}

        {isSelected && (
          <>
            <Button
              variant="destructive"
              size="icon"
              className="absolute -top-3 -right-3 h-6 w-6 rounded-full"
              onClick={handleDeleteClick}
            >
              <X className="h-3 w-3" />
            </Button>

            <div
              className="absolute bottom-0 right-0 w-6 h-6 bg-primary rounded-tl-md cursor-se-resize flex items-center justify-center"
              onMouseDown={handleResizeStart}
            >
              <Maximize2 className="h-3 w-3 text-white" />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
