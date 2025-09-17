// src/components/user/user-chat.tsx
import { useState, useEffect } from 'react';
import { ChatList } from '@/components/chat/chat-list';
import { ChatWindow } from '@/components/chat/chat-window';
import { useMobile } from '@/hooks/chat/use-mobile';
import { useChats } from '@/hooks/chat/useChats';
import type { Chat } from '@/types/chat.type';
import Header from '@/components/user/Header';
import { ModernSidebar } from '@/components/user/App-sidebar';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import type { RootState } from '@/redux/store';
import { useSelector } from 'react-redux';
import { getChatId, isValidChatId, extractId } from '@/utils/helpers/chatHelpers';
import { connectSocket, disconnectSocket } from '@/components/shared/socket.io-client';

export function UserChat() {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [isChatListOpen, setIsChatListOpen] = useState(false);
  const isMobile = useMobile();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const targetShopId = searchParams.get('shopId');
  const user = useSelector((state: RootState) => state.user.userDatas);
  const userId = extractId(user);

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
    userId,
    userType: 'user',
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

  useEffect(() => {
    if (userId) {
      connectSocket(userId, 'User');
    }

    return () => {
      disconnectSocket();
    };
  }, [userId]);

  useEffect(() => {
    if (targetShopId && userId) {
      createOrGetChat(userId, targetShopId).then((chat) => {
        if (chat && isValidChatId(getChatId(chat))) {
          setSelectedChat(chat);
        } else {
          toast({
            title: 'Error',
            description: 'Failed to start chat',
            variant: 'destructive',
          });
        }
      });
    }
  }, [targetShopId, createOrGetChat, userId, toast]);

  const handleSelectChat = async (chat: Chat) => {
    const chatId = getChatId(chat);
    if (!isValidChatId(chatId)) {
      toast({
        title: 'Error',
        description: 'Invalid chat selected - please try again',
        variant: 'destructive',
      });
      return;
    }
    setSelectedChat(chat);
    if (isMobile) setIsChatListOpen(false);
    if (chat.unreadCount > 0) {
      await markChatAsRead(chatId);
    }
  };

  const handleSearch = async (query: string) => {
    if (query.trim()) {
      await searchChats(query);
    } else {
      fetchChats(1);
    }
  };

  if (!userId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <p className="text-lg text-gray-600">Please log in to access chat</p>
        </div>
      </div>
    );
  }

  if (loading && chats.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading conversations...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden pt-16">
        <ModernSidebar />
        <div className="flex flex-1 h-[calc(100vh-80px)]">
          <div
            className={`
              ${isMobile
                ? `fixed inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 ease-in-out ${isChatListOpen ? 'translate-x-0' : '-translate-x-full'}`
                : 'w-80 border-r border-border'}
              bg-card h-full
            `}
          >
            <div className="p-4 border-b border-border">
              <h1 className="text-xl font-semibold text-foreground">My Conversations</h1>
              <p className="text-sm text-muted-foreground">
                Chat with pet care providers
                {totalUnreadCount > 0 && (
                  <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                    {totalUnreadCount} unread
                  </span>
                )}
              </p>
            </div>
            <div className="h-[calc(100%-80px)]">
              <ChatList
                selectedChat={selectedChat}
                onSelectChat={handleSelectChat}
                onClose={() => setIsChatListOpen(false)}
                isMobile={isMobile}
                chats={chats}
                userType="user"
                loading={loading}
                onSearch={handleSearch}
                onRefresh={refreshChats}
                totalUnreadCount={totalUnreadCount}
              />
            </div>
          </div>
          <div className="flex-1 flex flex-col h-full">
            <ChatWindow
              chat={selectedChat}
              onOpenChatList={() => setIsChatListOpen(true)}
              isMobile={isMobile}
              userType="user"
              userId={userId}
            />
          </div>
          {isMobile && isChatListOpen && (
            <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsChatListOpen(false)} />
          )}
        </div>
      </div>
    </div>
  );
};