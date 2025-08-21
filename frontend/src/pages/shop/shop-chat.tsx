import { useState, useEffect } from "react"
import { ChatList } from "@/components/chat/chat-list"
import { ChatWindow } from "@/components/chat/chat-window"
import { useMobile } from "@/hooks/chat/use-mobile"
import { useChats } from "@/hooks/chat/useChats"
import type { Chat } from "@/types/chat"
import { PetCareLayout } from "@/components/layout/PetCareLayout"
import Navbar from "@/components/shop/Navbar"
import Footer from "@/components/user/Footer"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface ShopChatProps {
  shopId: string; // Pass this from your auth context or parent component
}

export function ShopChat({ shopId }: ShopChatProps) {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [isChatListOpen, setIsChatListOpen] = useState(false)
  const isMobile = useMobile()
  const { toast } = useToast()

  // Use the custom hook to fetch chats dynamically
  const {
    chats,
    loading,
    error,
    totalUnreadCount,
    pagination,
    fetchChats,
    searchChats,
    createOrGetChat,
    markChatAsRead,
    refreshChats,
  } = useChats({
    shopId,
    userType: 'shop',
    autoRefresh: true,
    refreshInterval: 15000, // Refresh every 15 seconds for shops (more frequent)
  })

  // Handle errors
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      })
    }
  }, [error, toast])

  // Handle chat selection and mark as read
  const handleSelectChat = async (chat: Chat) => {
    setSelectedChat(chat)
    if (isMobile) setIsChatListOpen(false)
    
    // Mark chat as read when selected
    if (chat.unreadCount > 0) {
      const chatId = `${chat.userId}-${chat.shopId}`
      await markChatAsRead(chatId)
    }
  }

  // Handle search functionality
  const handleSearch = async (query: string) => {
    if (query.trim()) {
      await searchChats(query)
    } else {
      // If search is empty, fetch regular chats
      fetchChats(1)
    }
  }

  // Load more chats for pagination
  const loadMoreChats = async () => {
    if (pagination.currentPage < pagination.totalPages && !loading) {
      await fetchChats(pagination.currentPage + 1)
    }
  }

  if (loading && chats.length === 0) {
    return (
      <PetCareLayout>
        <Navbar  />
        <div className="flex items-center justify-center h-96">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading customer messages...</span>
          </div>
        </div>
        <Footer />
      </PetCareLayout>
    )
  }

  return (
    <PetCareLayout>
      <Navbar  />
      <div className="flex h-full bg-background">
        {/* Chat List - Desktop: Always visible, Mobile: Drawer */}
        <div
          className={`
            ${isMobile
              ? `fixed inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 ease-in-out ${isChatListOpen ? "translate-x-0" : "-translate-x-full"
              }`
              : "w-80 border-r border-border"
            }
            bg-card
          `}
        >
          <div className="p-4 border-b border-border">
            <h1 className="text-xl font-semibold text-foreground">Customer Messages</h1>
            <p className="text-sm text-muted-foreground">
              Chat with pet owners
              {totalUnreadCount > 0 && (
                <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                  {totalUnreadCount} unread
                </span>
              )}
            </p>
          </div>
          <ChatList
            selectedChat={selectedChat}
            onSelectChat={handleSelectChat}
            onClose={() => setIsChatListOpen(false)}
            isMobile={isMobile}
            chats={chats}
            userType="shop"
            loading={loading}
            onSearch={handleSearch}
            onLoadMore={loadMoreChats}
            hasMore={pagination.currentPage < pagination.totalPages}
            onRefresh={refreshChats}
          />
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col">
          <ChatWindow
            chat={selectedChat}
            onOpenChatList={() => setIsChatListOpen(true)}
            isMobile={isMobile}
            userType="shop"
            shopId={shopId}
          />
        </div>

        {/* Mobile Overlay */}
        {isMobile && isChatListOpen && (
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsChatListOpen(false)} />
        )}
      </div>
      <Footer />
    </PetCareLayout>
  )
}