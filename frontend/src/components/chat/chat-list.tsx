// chat-list.tsx
"use client"

import { useState, useMemo, useCallback } from "react"
import { Search, X, Filter, Users, MessageCircle, RefreshCw, Loader2 } from "lucide-react"
import { Input } from "@/components/chat/ui/input"
import { Button } from "@/components/chat/ui/button"
import { Badge } from "@/components/chat/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChatListItem } from "./chat-list-item"
import type { Chat } from "@/types/chat.type"

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

    if (activeFilter === "unread") {
      filtered = filtered.filter((chat) => chat.unreadCount > 0)
    }

    return filtered.sort((a, b) => {
      const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
      const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
      return timeB - timeA;
    });
  }, [chats, activeFilter])

  const unreadChatsCount = chats.filter((chat) => chat.unreadCount > 0).length

  return (
    <div className={`flex flex-col h-full ${isMobile ? 'p-2' : ''}`}>
      {/* Header */}
      <div className={`p-2 md:p-4 border-b border-border ${isMobile ? 'mb-2' : 'mb-4'}`}>
        <div className="flex items-center justify-between mb-4 md:mb-0">
          <div className="flex items-center gap-2 flex-1">
            <h1 className={`text-lg md:text-xl font-semibold text-foreground ${isMobile ? 'text-base' : ''}`}>Messages</h1>
            {totalUnreadCount > 0 && (
              <Badge variant="secondary" className={`h-4 md:h-5 min-w-4 md:min-w-5 text-xs ${isMobile ? 'text-[10px]' : ''}`}>
                {totalUnreadCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1 md:gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
              className={isMobile ? 'h-8 w-8 p-0' : ''}
            >
              {loading ? (
                <Loader2 className="h-3 w-3 md:h-4 md:w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3 md:h-4 md:w-4" />
              )}
            </Button>
            {isMobile && (
              <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-2 md:mb-4">
          <Search className="absolute left-2 md:left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            className="pl-8 md:pl-10 text-sm"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          {(isSearching || loading) && (
            <div className="absolute right-2 md:right-3 top-1/2 transform -translate-y-1/2">
              <Loader2 className="h-3 w-3 md:h-4 md:w-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Filter Tabs */}
        {!isMobile && (
          <Tabs value={activeFilter} onValueChange={(value) => setActiveFilter(value as "all" | "unread")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="all" className="flex items-center gap-2 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
                <MessageCircle className="h-4 w-4" />
                All ({filteredChats.length})
              </TabsTrigger>
              <TabsTrigger value="unread" className="flex items-center gap-2 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
                <Filter className="h-4 w-4" />
                Unread ({unreadChatsCount})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}
        {isMobile && (
          <div className="flex gap-1">
            <Button
              variant={activeFilter === "all" ? "default" : "outline"}
              size="sm"
              className="flex-1 text-xs"
              onClick={() => setActiveFilter("all")}
            >
              All ({filteredChats.length})
            </Button>
            <Button
              variant={activeFilter === "unread" ? "default" : "outline"}
              size="sm"
              className="flex-1 text-xs"
              onClick={() => setActiveFilter("unread")}
            >
              Unread ({unreadChatsCount})
            </Button>
          </div>
        )}
      </div>

      {/* Chat List with proper scrolling */}
      <div className="flex-1 overflow-y-auto md:h-[calc(100vh-200px)]">
        {loading && chats.length === 0 ? (
          <div className={`flex flex-col items-center justify-center h-24 md:h-32 text-center p-2 md:p-4 ${isMobile ? 'h-20' : ''}`}>
            <Loader2 className={`h-6 w-6 md:h-8 md:w-8 text-muted-foreground mb-2 animate-spin ${isMobile ? 'h-5 w-5' : ''}`} />
            <p className={`text-xs md:text-sm text-muted-foreground ${isMobile ? 'text-[10px]' : ''}`}>Loading conversations...</p>
          </div>
        ) : filteredChats.length === 0 ? (
          <div className={`flex flex-col items-center justify-center h-24 md:h-32 text-center p-2 md:p-4 ${isMobile ? 'h-20' : ''}`}>
            <Users className={`h-6 w-6 md:h-8 md:w-8 text-muted-foreground mb-2 ${isMobile ? 'h-5 w-5' : ''}`} />
            <p className={`text-xs md:text-sm text-muted-foreground ${isMobile ? 'text-[10px]' : ''}`}>
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
                className={`mt-2 text-xs ${isMobile ? 'h-6 px-2' : ''}`}
              >
                Clear search
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-y-auto space-y-1 md:space-y-2">
            {filteredChats.map((chat, index) => (
              <ChatListItem
                key={`${chat.userId}-${chat.shopId}-${index}`}
                chat={chat}
                isSelected={selectedChat === chat}
                onClick={() => onSelectChat(chat)}
                userType={userType}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}