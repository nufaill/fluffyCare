"use client"

import { useState, useEffect } from "react"
import { ChatList } from "./chat-list"
import { ChatWindow } from "./chat-window"
import { useMobile } from "@/hooks/chat/use-mobile"
import { useChats } from "@/hooks/chat/useChats"
import type { Chat } from "@/types/chat"
import { Loader2 } from "lucide-react"

interface ChatContainerProps {
  userId?: string;
  shopId?: string;
  userType: 'user' | 'shop';
  autoRefresh?: boolean;
}

export function ChatContainer({ 
  userId, 
  shopId, 
  userType, 
  autoRefresh = true 
}: ChatContainerProps) {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [isChatListOpen, setIsChatListOpen] = useState(false)
  const isMobile = useMobile()

  const {
    chats,
    loading,
    error,
    totalUnreadCount,
    createOrGetChat,
    markChatAsRead,
    searchChats,
    refreshChats,
  } = useChats({
    userId,
    shopId,
    userType,
    autoRefresh,
    refreshInterval: 30000, // Refresh every 30 seconds
  });

  // Handle chat selection
  const handleSelectChat = async (chat: Chat) => {
    setSelectedChat(chat);
    
    // Mark chat as read when selected
    const chatId = `${chat.userId}-${chat.shopId}`;
    if (chat.unreadCount > 0) {
      await markChatAsRead(chatId);
    }
    
    if (isMobile) {
      setIsChatListOpen(false);
    }
  };

  // Handle creating new chat (useful for starting new conversations)
  const handleCreateChat = async (targetUserId: string, targetShopId: string) => {
    const newChat = await createOrGetChat(targetUserId, targetShopId);
    if (newChat) {
      setSelectedChat(newChat);
      if (isMobile) {
        setIsChatListOpen(false);
      }
    }
  };

  if (loading && chats.length === 0) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading chats...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <button
            onClick={refreshChats}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-background">
      {/* Chat List - Desktop: Always visible, Mobile: Drawer */}
      <div
        className={`
        ${
          isMobile
            ? `fixed inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 ease-in-out ${
                isChatListOpen ? "translate-x-0" : "-translate-x-full"
              }`
            : "w-80 border-r border-border"
        }
        bg-card
      `}
      >
        <ChatList
          chats={chats}
          selectedChat={selectedChat}
          onSelectChat={handleSelectChat}
          onClose={() => setIsChatListOpen(false)}
          isMobile={isMobile}
          userType={userType}
          totalUnreadCount={totalUnreadCount}
          onSearch={searchChats}
          loading={loading}
          onRefresh={refreshChats}
        />
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        <ChatWindow 
          chat={selectedChat} 
          onOpenChatList={() => setIsChatListOpen(true)} 
          isMobile={isMobile}
          userType={userType}
          currentUserId={userType === 'user' ? userId : shopId}
        />
      </div>

      {/* Mobile Overlay */}
      {isMobile && isChatListOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsChatListOpen(false)} />
      )}
    </div>
  )
}