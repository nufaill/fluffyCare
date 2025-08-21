"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/chat/ui/avatar"
import { Button } from "@/components/ui/button"
import { ReactionPicker } from "./reaction-picker"
import { MessageOptions } from "./message-options"
import type { Message } from "@/types/message"
import { format, isToday, isYesterday } from "date-fns"
import { Check, CheckCheck, Download, Play, Pause, Reply } from "lucide-react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface MessageBubbleProps {
  message: Message
  isOwn: boolean
  showAvatar: boolean
  userName?: string
  userAvatar?: string
  replyToMessage?: Message | null
  onReactionAdd: (messageId: string, emoji: string) => void
  onReactionRemove: (messageId: string, emoji: string) => void
  onReply: (message: Message) => void
  onEdit: (message: Message) => void
  onDelete: (message: Message) => void
  onForward: (message: Message) => void
  onCopy: (content: string) => void
  onReport: (message: Message) => void
}

export function MessageBubble({
  message,
  isOwn,
  showAvatar,
  userName,
  userAvatar,
  replyToMessage,
  onReactionAdd,
  onReactionRemove,
  onReply,
  onEdit,
  onDelete,
  onForward,
  onCopy,
  onReport,
}: MessageBubbleProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [showOptions, setShowOptions] = useState(false)

  const formatTime = (date: Date) => {
    if (isToday(date)) {
      return format(date, "HH:mm")
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, "HH:mm")}`
    } else {
      return format(date, "MMM d, HH:mm")
    }
  }

  const getStatusIcon = () => {
    if (!isOwn) return null

    if (message.readAt) {
      return <CheckCheck className="h-3 w-3 text-blue-500" />
    } else if (message.deliveredAt) {
      return <CheckCheck className="h-3 w-3 text-muted-foreground" />
    } else {
      return <Check className="h-3 w-3 text-muted-foreground" />
    }
  }

  const groupedReactions = message.reactions.reduce(
    (acc, reaction) => {
      if (!acc[reaction.emoji]) {
        acc[reaction.emoji] = { count: 0, users: [] }
      }
      acc[reaction.emoji].count++
      acc[reaction.emoji].users.push(reaction.userId.toString())
      return acc
    },
    {} as Record<string, { count: number; users: string[] }>,
  )

  const handleReactionClick = (emoji: string) => {
    const currentUserId = "current-user-id" // TODO: Get from context
    const hasReacted = groupedReactions[emoji]?.users.includes(currentUserId)

    if (hasReacted) {
      onReactionRemove(message.chatId.toString(), emoji)
    } else {
      onReactionAdd(message.chatId.toString(), emoji)
    }
  }

  const renderMessageContent = () => {
    switch (message.messageType) {
      case "Text":
        return <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>

      case "Image":
        return (
          <div className="space-y-2">
            <div className="relative rounded-lg overflow-hidden bg-muted max-w-xs">
              <img
                src={message.mediaUrl || "/placeholder.svg?height=200&width=300&query=pet photo"}
                alt="Shared image"
                className="w-full h-auto"
              />
            </div>
            {message.content && <p className="text-sm leading-relaxed">{message.content}</p>}
          </div>
        )

      case "Video":
        return (
          <div className="space-y-2">
            <div className="relative rounded-lg overflow-hidden bg-muted max-w-xs">
              <div className="aspect-video bg-muted flex items-center justify-center">
                <Button variant="ghost" size="sm" className="rounded-full">
                  <Play className="h-6 w-6" />
                </Button>
              </div>
            </div>
            {message.content && <p className="text-sm leading-relaxed">{message.content}</p>}
          </div>
        )

      case "Audio":
        return (
          <div className="flex items-center gap-3 bg-muted/50 rounded-lg p-3 max-w-xs">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full h-8 w-8 p-0"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <div className="flex-1">
              <div className="h-1 bg-muted rounded-full">
                <div className="h-1 bg-primary rounded-full w-1/3"></div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">0:23</p>
            </div>
          </div>
        )

      case "File":
        return (
          <div className="flex items-center gap-3 bg-muted/50 rounded-lg p-3 max-w-xs">
            <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Download className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{message.content || "Document.pdf"}</p>
              <p className="text-xs text-muted-foreground">2.4 MB</p>
            </div>
          </div>
        )

      default:
        return <p className="text-sm">{message.content}</p>
    }
  }

  return (
    <motion.div
      className={`group flex gap-3 mb-4 ${isOwn ? "flex-row-reverse" : "flex-row"}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setShowOptions(true)}
      onMouseLeave={() => setShowOptions(false)}
    >
      {/* Avatar */}
      {showAvatar && !isOwn && (
        <Avatar className="h-8 w-8 mt-1">
          <AvatarImage src={userAvatar || "/placeholder.svg"} />
          <AvatarFallback className="bg-primary/10 text-primary text-xs">{userName?.charAt(0) || "U"}</AvatarFallback>
        </Avatar>
      )}
      {showAvatar && isOwn && <div className="w-8" />}

      {/* Message Content */}
      <div className={`flex flex-col max-w-[70%] ${isOwn ? "items-end" : "items-start"}`}>
        {/* Reply Preview */}
        {replyToMessage && (
          <div
            className={`mb-2 p-2 bg-muted/50 rounded-lg border-l-2 border-primary max-w-full ${isOwn ? "self-end" : "self-start"}`}
          >
            <div className="flex items-center gap-1 mb-1">
              <Reply className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Replying to {isOwn ? "You" : userName}</span>
            </div>
            <p className="text-xs text-muted-foreground truncate">{replyToMessage.content}</p>
          </div>
        )}

        {/* Message Bubble */}
        <div className="relative">
          <div
            className={`
            rounded-2xl px-4 py-2 shadow-sm relative
            ${isOwn ? "bg-primary text-primary-foreground rounded-br-md" : "bg-card border border-border rounded-bl-md"}
          `}
          >
            {renderMessageContent()}
          </div>

          <AnimatePresence>
            {showOptions && (
              <motion.div
                className={`absolute top-0 flex items-center gap-1 ${isOwn ? "-left-20" : "-right-20"}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <ReactionPicker onReactionSelect={(emoji) => onReactionAdd(message.chatId.toString(), emoji)} />
                <MessageOptions
                  message={message}
                  isOwn={isOwn}
                  onReply={onReply}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onForward={onForward}
                  onCopy={onCopy}
                  onReport={onReport}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Reactions */}
        {Object.keys(groupedReactions).length > 0 && (
          <motion.div
            className="flex gap-1 mt-1 flex-wrap"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {Object.entries(groupedReactions).map(([emoji, data]) => (
              <motion.div key={emoji} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-6 px-2 py-0 text-xs hover:bg-accent cursor-pointer"
                  onClick={() => handleReactionClick(emoji)}
                >
                  {emoji} {data.count > 1 && data.count}
                </Button>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Timestamp and Status */}
        <div className={`flex items-center gap-1 mt-1 px-1 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
          <span className="text-xs text-muted-foreground">
            {message.createdAt ? formatTime(message.createdAt) : "Now"}
          </span>
          {getStatusIcon()}
        </div>
      </div>
    </motion.div>
  )
}
