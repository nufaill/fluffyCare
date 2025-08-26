import { useState, useEffect } from 'react';
import { ChatList } from '@/components/chat/chat-list';
import { ChatWindow } from '@/components/chat/chat-window';
import { useMobile } from '@/hooks/chat/use-mobile';
import { useChats } from '@/hooks/chat/useChats';
import type { Chat } from '@/types/chat.type';
import { PetCareLayout } from '@/components/layout/PetCareLayout';
import Navbar from '@/components/shop/Navbar';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { RootState } from '@/redux/store';
import { useSelector } from 'react-redux';

export function ShopChat() {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [isChatListOpen, setIsChatListOpen] = useState(false);
  const isMobile = useMobile();
  const { toast } = useToast();
  const { shopData: shop } = useSelector((state: RootState) => state.shop);
  const shopId = shop?.id;
  const {
    chats,
    loading,
    error,
    totalUnreadCount,
    fetchChats,
    searchChats,
    markChatAsRead,
    refreshChats,
  } = useChats({
    shopId,
    userType: 'shop',
    autoRefresh: true,
    refreshInterval: 15000,
  });

  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  const handleSelectChat = async (chat: Chat) => {
    setSelectedChat(chat);
    if (isMobile) setIsChatListOpen(false);
    if (chat.unreadCount > 0) {
      await markChatAsRead(`${chat.userId}-${chat.shopId}`);
    }
  };

  const handleSearch = async (query: string) => {
    if (query.trim()) {
      await searchChats(query);
    } else {
      fetchChats(1);
    }
  };


  if (!shopId) {
    return (
      <PetCareLayout>
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <p className="text-lg text-gray-600">Please log in to access chat</p>
        </div>
      </PetCareLayout>
    );
  }

  if (loading && chats.length === 0) {
    return (
      <PetCareLayout>
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading customer messages...</span>
        </div>
      </PetCareLayout>
    );
  }

  return (
    <PetCareLayout>
      <Navbar />
      <div className="flex h-full bg-background">
        <div
          className={`
            ${isMobile
              ? `fixed inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 ease-in-out ${isChatListOpen ? 'translate-x-0' : '-translate-x-full'}`
              : 'w-80 border-r border-border'}
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
            onRefresh={refreshChats}
            totalUnreadCount={totalUnreadCount}
          />
        </div>
        <div className="flex-1 flex flex-col">
          <ChatWindow
            chat={selectedChat}
            onOpenChatList={() => setIsChatListOpen(true)}
            isMobile={isMobile}
            userType="shop"
            userId={shopId}
          />
        </div>
        {isMobile && isChatListOpen && (
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsChatListOpen(false)} />
        )}
      </div>
    </PetCareLayout>
  );
}