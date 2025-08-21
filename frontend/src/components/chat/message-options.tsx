"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Reply, Edit, Copy, Forward, Trash2, Flag } from "lucide-react"
import type { Message } from "@/types/message"

interface MessageOptionsProps {
  message: Message
  isOwn: boolean
  onReply: (message: Message) => void
  onEdit: (message: Message) => void
  onDelete: (message: Message) => void
  onForward: (message: Message) => void
  onCopy: (content: string) => void
  onReport: (message: Message) => void
}

export function MessageOptions({
  message,
  isOwn,
  onReply,
  onEdit,
  onDelete,
  onForward,
  onCopy,
  onReport,
}: MessageOptionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreHorizontal className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={isOwn ? "end" : "start"} sideOffset={8}>
        <DropdownMenuItem onClick={() => onReply(message)}>
          <Reply className="h-4 w-4 mr-2" />
          Reply
        </DropdownMenuItem>

        {isOwn && message.messageType === "Text" && (
          <DropdownMenuItem onClick={() => onEdit(message)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </DropdownMenuItem>
        )}

        <DropdownMenuItem onClick={() => onCopy(message.content)}>
          <Copy className="h-4 w-4 mr-2" />
          Copy
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => onForward(message)}>
          <Forward className="h-4 w-4 mr-2" />
          Forward
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {isOwn ? (
          <DropdownMenuItem onClick={() => onDelete(message)} className="text-destructive focus:text-destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => onReport(message)} className="text-destructive focus:text-destructive">
            <Flag className="h-4 w-4 mr-2" />
            Report
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
