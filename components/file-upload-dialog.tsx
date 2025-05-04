"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Upload, File } from "lucide-react"

interface FileUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onFileSelected: (
    file: File,
    fileUrl: string,
    fileType: string,
    dimensions?: { width: number; height: number },
  ) => void
  title: string
  accept: string
  description: string
}

export function FileUploadDialog({
  open,
  onOpenChange,
  onFileSelected,
  title,
  accept,
  description,
}: FileUploadDialogProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      processFile(file)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      processFile(file)
    }
  }

  const processFile = (file: File) => {
    // Check if file type is accepted
    if (!file.type.match(accept.replace(/,/g, "|").replace(/\*/g, ".*"))) {
      alert(`File type not supported. Please upload a ${description}.`)
      return
    }

    setSelectedFile(file)
    const fileUrl = URL.createObjectURL(file)

    // For images, get dimensions
    if (file.type.startsWith("image/")) {
      const img = new Image()
      img.onload = () => {
        onFileSelected(file, fileUrl, file.type, { width: img.width, height: img.height })
      }
      img.src = fileUrl
    } else {
      // For other files like PDFs
      onFileSelected(file, fileUrl, file.type)
    }
  }

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div
          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 transition-colors ${
            isDragging ? "border-primary bg-primary/10" : "border-muted-foreground/25"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <File className="h-10 w-10 text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground mb-2">Drag and drop your file here, or</p>
          <Button onClick={handleBrowseClick} variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Browse Files
          </Button>
          <input ref={fileInputRef} type="file" accept={accept} onChange={handleFileChange} className="hidden" />
          <p className="mt-4 text-xs text-muted-foreground">{description}</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
