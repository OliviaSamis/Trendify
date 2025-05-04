"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface TextOverlayProps {
  text: string
  style: {
    bold: boolean
    italic: boolean
    underline: boolean
    align: "left" | "center" | "right"
    fontSize?: number
    color?: string
  }
  position: { x: number; y: number }
  onPositionChange: (position: { x: number; y: number }) => void
  onTextChange: (text: string) => void
  onDelete: () => void
  isSelected: boolean
}

export function TextOverlay({
  text,
  style,
  position,
  onPositionChange,
  onTextChange,
  onDelete,
  isSelected,
}: TextOverlayProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isEditing, setIsEditing] = useState(false)
  const textRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEditing])

  const handleDragStart = (e: React.MouseEvent) => {
    if (!textRef.current) return

    setIsDragging(true)
    const rect = textRef.current.getBoundingClientRect()
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  const handleDragMove = (e: MouseEvent) => {
    if (!isDragging || !textRef.current) return

    const parentRect = textRef.current.parentElement?.getBoundingClientRect()
    if (!parentRect) return

    // Calculate new position relative to parent
    const newX = Math.max(
      0,
      Math.min(e.clientX - parentRect.left - dragOffset.x, parentRect.width - textRef.current.offsetWidth),
    )
    const newY = Math.max(
      0,
      Math.min(e.clientY - parentRect.top - dragOffset.y, parentRect.height - textRef.current.offsetHeight),
    )

    onPositionChange({ x: newX, y: newY })
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  // Add and remove event listeners for drag
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleDragMove)
      window.addEventListener("mouseup", handleDragEnd)
    }

    return () => {
      window.removeEventListener("mousemove", handleDragMove)
      window.removeEventListener("mouseup", handleDragEnd)
    }
  }, [isDragging])

  const handleDoubleClick = () => {
    setIsEditing(true)
  }

  const handleInputBlur = () => {
    setIsEditing(false)
  }

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setIsEditing(false)
    }
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete()
  }

  // Ensure we have a valid color with a fallback
  const textColor = style.color || "#ffffff"

  return (
    <div
      ref={textRef}
      className={cn("absolute cursor-move", isSelected && "outline outline-2 outline-primary")}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        fontWeight: style.bold ? "bold" : "normal",
        fontStyle: style.italic ? "italic" : "normal",
        textDecoration: style.underline ? "underline" : "none",
        textAlign: style.align,
        fontSize: `${style.fontSize || 24}px`,
        color: textColor,
        textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
        zIndex: 10,
      }}
      onMouseDown={handleDragStart}
      onDoubleClick={handleDoubleClick}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          className="bg-transparent border border-primary px-2 py-1 min-w-[100px] outline-none"
          style={{
            fontWeight: style.bold ? "bold" : "normal",
            fontStyle: style.italic ? "italic" : "normal",
            textDecoration: style.underline ? "underline" : "none",
            textAlign: style.align,
            fontSize: `${style.fontSize || 24}px`,
            color: textColor,
          }}
        />
      ) : (
        <div className="relative px-2 py-1 min-w-[100px]">
          {text}
          {isSelected && (
            <Button
              variant="destructive"
              size="icon"
              className="absolute -top-3 -right-3 h-6 w-6 rounded-full"
              onClick={handleDeleteClick}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
