"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/chat/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Menu, MoreVertical, Phone, Video, Info } from "lucide-react"
import type { Chat } from "@/types/chat"

interface ChatHeaderProps {
  chat: Chat
  onOpenChatList: () => void
  isMobile: boolean
  userType?: "user" | "shop"
}

export function ChatHeader({ chat, onOpenChatList, isMobile, userType = "user" }: ChatHeaderProps) {
  const mockUsers =
    userType === "shop"
      ? [
          { name: "Sarah Johnson", avatar: "/woman-golden-retriever.png", petType: "Golden Retriever", isOnline: true },
          { name: "Mike Chen", avatar: "/man-and-cat.png", petType: "Persian Cat", isOnline: false },
          { name: "Emma Davis", avatar: "/woman-small-dog.png", petType: "Pomeranian", isOnline: true },
        ]
      : [
          { name: "Paws & Claws Grooming", avatar: "/pet-owner-avatar.png", petType: "Pet Grooming", isOnline: true },
          { name: "Happy Tails Spa", avatar: "/pet-owner-avatar.png", petType: "Pet Spa", isOnline: false },
          { name: "Furry Friends Care", avatar: "/pet-owner-avatar.png", petType: "Pet Care", isOnline: true },
        ]

  const userIndex = Number.parseInt(chat.userId.toString().slice(-1)) % mockUsers.length
  const user = mockUsers[userIndex]

  return (
    <div className="p-4 border-b border-border bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isMobile && (
            <Button variant="ghost" size="sm" onClick={onOpenChatList}>
              <Menu className="h-5 w-5" />
            </Button>
          )}

          {/* User Info */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              {user.isOnline && (
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 border-2 border-background rounded-full" />
              )}
            </div>

            <div>
              <h2 className="font-medium text-foreground">{user.name}</h2>
              <p className="text-sm text-muted-foreground">
                {user.isOnline ? "Online" : "Last seen 2h ago"} • {user.petType}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Video className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Info className="h-4 w-4 mr-2" />
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem>Clear Chat</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Block User</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
