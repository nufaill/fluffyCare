"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/chat/ui/avatar"
import { Badge } from "@/components/chat/ui/badge"
import type { Chat } from "@/types/chat"
import { format, isToday, isYesterday } from "date-fns"
import { ImageIcon, Video, Mic, Paperclip } from "lucide-react"

interface ChatListItemProps {
  chat: Chat
  isSelected: boolean
  onClick: () => void
  userType: "user" | "shop"
}

// Mock user/shop data - In real app, this would come from user/shop service
const getMockUserData = (id: string, type: "user" | "shop") => {
  const users = [
    { name: "Sarah Johnson", avatar: "/woman-golden-retriever.png", initials: "SJ", petType: "Golden Retriever" },
    { name: "Mike Chen", avatar: "/man-and-cat.png", initials: "MC", petType: "Persian Cat" },
    { name: "Emma Davis", avatar: "/woman-small-dog.png", initials: "ED", petType: "Pomeranian" },
    { name: "Alex Rodriguez", avatar: "/person-with-large-dog.png", initials: "AR", petType: "German Shepherd" },
    { name: "Lisa Thompson", avatar: "/woman-with-beagle.png", initials: "LT", petType: "Beagle" },
    { name: "David Kim", avatar: "/agustin-testimonial.png", initials: "DK", petType: "Tabby Cat" },
    { name: "Rachel Green", avatar: "/woman-with-poodle.png", initials: "RG", petType: "Poodle" },
  ];

  const shops = [
    { name: "Paws & Claws Grooming", avatar: "/pet-shop-1.png", initials: "PC", petType: "Pet Grooming" },
    { name: "Happy Tails Spa", avatar: "/pet-shop-2.png", initials: "HT", petType: "Pet Spa" },
    { name: "Furry Friends Care", avatar: "/pet-shop-3.png", initials: "FF", petType: "Pet Care" },
    { name: "Pets Paradise", avatar: "/pet-shop-4.png", initials: "PP", petType: "Pet Store" },
    { name: "Animal Wellness Center", avatar: "/pet-shop-5.png", initials: "AW", petType: "Veterinary" },
    { name: "The Grooming Station", avatar: "/pet-shop-6.png", initials: "TG", petType: "Grooming" },
  ];

  const data = type === "user" ? users : shops;
  const index = parseInt(id.slice(-1)) % data.length;
  return data[index];
};

export function ChatListItem({ chat, isSelected, onClick, userType }: ChatListItemProps) {
  const formatTime = (date: Date | null) => {
    if (!date) return ""

    if (isToday(date)) {
      return format(date, "HH:mm")
    } else if (isYesterday(date)) {
      return "Yesterday"
    } else {
      return format(date, "MMM d")
    }
  }

  const getMessagePreview = () => {
    const icons = {
      Image: <ImageIcon className="h-3 w-3 mr-1" />,
      Video: <Video className="h-3 w-3 mr-1" />,
      Audio: <Mic className="h-3 w-3 mr-1" />,
      File: <Paperclip className="h-3 w-3 mr-1" />,
    }

    if (chat.lastMessageType !== "Text") {
      return (
        <div className="flex items-center">
          {icons[chat.lastMessageType]}
          <span>
            {chat.lastMessageType === "Image" && "Photo"}
            {chat.lastMessageType === "Video" && "Video"}
            {chat.lastMessageType === "Audio" && "Voice message"}
            {chat.lastMessageType === "File" && "File"}
          </span>
        </div>
      )
    }
    return chat.lastMessage
  }

  // Get the other party's data (if user viewing, show shop data, and vice versa)
  const otherPartyId = userType === "user" ? chat.shopId.toString() : chat.userId.toString();
  const otherPartyType = userType === "user" ? "shop" : "user";
  const otherParty = getMockUserData(otherPartyId, otherPartyType);

  return (
    <div
      className={`
        p-4 border-b border-border cursor-pointer transition-all duration-200 hover:bg-accent/50
        ${isSelected ? "bg-accent border-l-4 border-l-primary" : ""}
        ${chat.unreadCount > 0 ? "bg-accent/20" : ""}
      `}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {/* Avatar with online indicator */}
        <div className="relative">
          <Avatar className="h-12 w-12">
            <AvatarImage src={otherParty.avatar || "/placeholder.svg"} alt={otherParty.name} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">{otherParty.initials}</AvatarFallback>
          </Avatar>
          {/* Random online indicator for demo */}
          {parseInt(otherPartyId) % 3 === 0 && (
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 border-2 border-background rounded-full" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex flex-col">
              <h3 className={`font-medium truncate ${chat.unreadCount > 0 ? "text-foreground" : "text-foreground"}`}>
                {otherParty.name}
              </h3>
              <span className="text-xs text-muted-foreground">{otherParty.petType}</span>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-xs text-muted-foreground">{formatTime(chat.lastMessageAt)}</span>
              {chat.unreadCount > 0 && (
                <Badge variant="default" className="h-5 min-w-5 text-xs bg-primary">
                  {chat.unreadCount}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center">
            <p
              className={`text-sm truncate flex-1 ${
                chat.unreadCount > 0 ? "text-foreground font-medium" : "text-muted-foreground"
              }`}
            >
              {getMessagePreview()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}