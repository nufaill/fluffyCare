"use client"

import { Button } from "@/components/ui/button"
import { X, FileText, ImageIcon, Video, Music } from "lucide-react"

interface FileAttachment {
  id: string
  file: File
  preview?: string
  type: "image" | "video" | "audio" | "document"
}

interface FileAttachmentPreviewProps {
  attachments: FileAttachment[]
  onRemove: (id: string) => void
}

export function FileAttachmentPreview({ attachments, onRemove }: FileAttachmentPreviewProps) {
  if (attachments.length === 0) return null

  const getFileIcon = (type: FileAttachment["type"]) => {
    switch (type) {
      case "image":
        return <ImageIcon className="h-4 w-4" />
      case "video":
        return <Video className="h-4 w-4" />
      case "audio":
        return <Music className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="border-t border-border bg-card p-3">
      <div className="flex flex-wrap gap-2">
        {attachments.map((attachment) => (
          <div key={attachment.id} className="relative flex items-center gap-2 bg-muted rounded-lg p-2 max-w-xs">
            {attachment.type === "image" && attachment.preview ? (
              <div className="relative">
                <img
                  src={attachment.preview || "/placeholder.svg"}
                  alt={attachment.file.name}
                  className="h-12 w-12 object-cover rounded"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 rounded-full"
                  onClick={() => onRemove(attachment.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-1">
                <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  {getFileIcon(attachment.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{attachment.file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(attachment.file.size)}</p>
                </div>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => onRemove(attachment.id)}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
