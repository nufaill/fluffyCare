"use client"

import { useEffect, useRef, useState } from "react"
import { MessageBubble } from "./message-bubble"
import type { Message } from "@/types/message"
import { format, isSameDay } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { Loader2, MessageCircle } from "lucide-react"

interface MessageListProps {
  messages: Message[]
  currentUserId: string
  userType: "user" | "shop"
  loading?: boolean
  onReactionAdd: (messageId: string, emoji: string) => void
  onReactionRemove: (messageId: string, emoji: string) => void
  onDeleteMessage: (messageId: string) => void
}

// Mock user data - In real app, get from user service
const getMockUserData = (id: string, type: "user" | "shop") => {
  const users = [
    { name: "Sarah Johnson", avatar: "/woman-golden-retriever.png" },
    { name: "Mike Chen", avatar: "/man-and-cat.png" },
    { name: "Emma Davis", avatar: "/woman-small-dog.png" },
    { name: "Alex Rodriguez", avatar: "/person-with-large-dog.png" },
    { name: "Lisa Thompson", avatar: "/woman-with-beagle.png" },
    { name: "David Kim", avatar: "/agustin-testimonial.png" },
    { name: "Rachel Green", avatar: "/woman-with-poodle.png" },
  ];

  const shops = [
    { name: "Paws & Claws Grooming", avatar: "/pet-shop-1.png" },
    { name: "Happy Tails Spa", avatar: "/pet-shop-2.png" },
    { name: "Furry Friends Care", avatar: "/pet-shop-3.png" },
    { name: "Pets Paradise", avatar: "/pet-shop-4.png" },
    { name: "Animal Wellness Center", avatar: "/pet-shop-5.png" },
    { name: "The Grooming Station", avatar: "/pet-shop-6.png" },
  ];

  const data = type === "user" ? users : shops;
  const index = parseInt(id.slice(-1)) % data.length;
  return data[index];
};

export function MessageList({ 
  messages, 
  currentUserId, 
  userType,
  loading = false,
  onReactionAdd,
  onReactionRemove,
  onDeleteMessage
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null)
  const { toast } = useToast()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const shouldShowAvatar = (message: Message, index: number) => {
    // Always show avatar for the other party's messages
    const isOwn = userType === "user" 
      ? message.senderRole === "User" 
      : message.senderRole === "Shop";
    
    if (isOwn) return false;

    const nextMessage = messages[index + 1]
    if (!nextMessage) return true

    return nextMessage.senderRole !== message.senderRole
  }

  const shouldShowDateSeparator = (message: Message, index: number) => {
    if (index === 0) return true

    const prevMessage = messages[index - 1]
    if (!prevMessage.createdAt || !message.createdAt) return false

    return !isSameDay(prevMessage.createdAt, message.createdAt)
  }

  const handleReactionAdd = (messageId: string, emoji: string) => {
    onReactionAdd(messageId, emoji);
    toast({
      description: `Added ${emoji} reaction`,
    });
  }

  const handleReactionRemove = (messageId: string, emoji: string) => {
    onReactionRemove(messageId, emoji);
    toast({
      description: `Removed ${emoji} reaction`,
    });
  }

  const handleReply = (message: Message) => {
    setReplyToMessage(message)
    toast({
      description: "Reply mode activated",
    })
  }

  const handleEdit = (message: Message) => {
    console.log("Editing message:", message)
    toast({
      description: "Edit mode activated",
    })
  }

  const handleDelete = (message: Message) => {
    onDeleteMessage(message.chatId);
    toast({
      description: "Message deleted",
      variant: "destructive",
    });
  }

  const handleForward = (message: Message) => {
    console.log("Forwarding message:", message)
    toast({
      description: "Message forwarded",
    })
  }

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content)
    toast({
      description: "Message copied to clipboard",
    })
  }

  const handleReport = (message: Message) => {
    console.log("Reporting message:", message)
    toast({
      description: "Message reported",
      variant: "destructive",
    })
  }

  if (loading && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-1">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
          </div>
        </div>
      ) : (
        messages.map((message, index) => {
          const isOwn = userType === "user" 
            ? message.senderRole === "User" 
            : message.senderRole === "Shop";
          
          const showAvatar = shouldShowAvatar(message, index);
          const showDateSeparator = shouldShowDateSeparator(message, index);
          
          // Get user data for display
          const senderId = message.senderRole === "User" ? "user" : "shop";
          const user = getMockUserData(currentUserId, senderId);

          return (
            <div key={`${message.chatId}-${index}`}>
              {/* Date Separator */}
              {showDateSeparator && message.createdAt && (
                <div className="flex items-center justify-center my-4">
                  <div className="bg-muted px-3 py-1 rounded-full">
                    <span className="text-xs text-muted-foreground">
                      {format(message.createdAt, "MMMM d, yyyy")}
                    </span>
                  </div>
                </div>
              )}

              {/* Message */}
              <MessageBubble
                message={message}
                isOwn={isOwn}
                showAvatar={showAvatar}
                userName={user.name}
                userAvatar={user.avatar}
                replyToMessage={replyToMessage}
                onReactionAdd={handleReactionAdd}
                onReactionRemove={handleReactionRemove}
                onReply={handleReply}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onForward={handleForward}
                onCopy={handleCopy}
                onReport={handleReport}
              />
            </div>
          )
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  )
}