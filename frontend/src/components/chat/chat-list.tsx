"use client"

import { useState, useMemo, useCallback } from "react"
import { Search, X, Filter, Users, MessageCircle, RefreshCw, Loader2 } from "lucide-react"
import { Input } from "@/components/chat/ui/input"
import { Button } from "@/components/chat/ui/button"
import { Badge } from "@/components/chat/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChatListItem } from "./chat-list-item"
import type { Chat } from "@/types/chat"

interface ChatListProps {
  chats: Chat[]
  selectedChat: Chat | null
  onSelectChat: (chat: Chat) => void
  onClose: () => void
  isMobile: boolean
  userType: "user" | "shop"
  totalUnreadCount: number
  onSearch: (query: string, page?: number, limit?: number) => void
  loading: boolean
  onRefresh: () => void
}

export function ChatList({
  chats,
  selectedChat,
  onSelectChat,
  onClose,
  isMobile,
  userType,
  totalUnreadCount,
  onSearch,
  loading,
  onRefresh,
}: ChatListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState<"all" | "unread">("all")
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = useCallback(async (query: string) => {
    if (query.trim() === "") {
      onRefresh()
      return
    }

    setIsSearching(true)
    try {
      await onSearch(query.trim())
    } finally {
      setIsSearching(false)
    }
  }, [onSearch, onRefresh])

  // Debounced search
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout
      return (query: string) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => handleSearch(query), 500)
      }
    })(),
    [handleSearch]
  )

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    debouncedSearch(value)
  }

  const filteredChats = useMemo(() => {
    let filtered = chats

    // Filter by unread status
    if (activeFilter === "unread") {
      filtered = filtered.filter((chat) => chat.unreadCount > 0)
    }

    // Sort by last message time (most recent first)
    return filtered.sort((a, b) => {
      const timeA = a.lastMessageAt?.getTime() || 0
      const timeB = b.lastMessageAt?.getTime() || 0
      return timeB - timeA
    })
  }, [chats, activeFilter])

  const unreadChatsCount = chats.filter((chat) => chat.unreadCount > 0).length

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-foreground">Messages</h1>
            {totalUnreadCount > 0 && (
              <Badge variant="secondary" className="h-5 min-w-5 text-xs">
                {totalUnreadCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost" 
              size="sm"
              onClick={onRefresh}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
            {isMobile && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          {(isSearching || loading) && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Filter Tabs */}
        <Tabs value={activeFilter} onValueChange={(value) => setActiveFilter(value as "all" | "unread")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              All ({filteredChats.length})
            </TabsTrigger>
            <TabsTrigger value="unread" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Unread ({unreadChatsCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {loading && chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center p-4">
            <Loader2 className="h-8 w-8 text-muted-foreground mb-2 animate-spin" />
            <p className="text-sm text-muted-foreground">Loading conversations...</p>
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center p-4">
            <Users className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              {searchQuery 
                ? "No conversations found" 
                : activeFilter === "unread" 
                  ? "No unread messages" 
                  : "No conversations yet"
              }
            </p>
            {searchQuery && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setSearchQuery("")
                  onRefresh()
                }}
                className="mt-2"
              >
                Clear search
              </Button>
            )}
          </div>
        ) : (
          filteredChats.map((chat, index) => (
            <ChatListItem
              key={`${chat.userId}-${chat.shopId}-${index}`}
              chat={chat}
              isSelected={selectedChat === chat}
              onClick={() => onSelectChat(chat)}
              userType={userType}
            />
          ))
        )}
      </div>
    </div>
  )
}