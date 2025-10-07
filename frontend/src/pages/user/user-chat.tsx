"use client"

import { useState, useEffect } from 'react';
import { ChatList } from '@/components/chat/chat-list';
import { ChatWindow } from '@/components/chat/chat-window';
import { useMobile } from '@/hooks/chat/use-mobile';
import { useChats } from '@/hooks/chat/useChats';
import type { Chat } from '@/types/chat.type';
import Header from '@/components/user/Header';
import Footer from '@/components/user/Footer';
import { ModernSidebar } from '@/components/user/App-sidebar';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MessageCircle } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import type { RootState } from '@/redux/store';
import { useSelector } from 'react-redux';
import { getChatId, isValidChatId, extractId } from '@/utils/helpers/chatHelpers';
import { connectSocket, disconnectSocket } from '@/components/shared/socket.io-client';
import { Button } from '@/components/chat/ui/button';

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

  useEffect(() => {
    if (!isMobile) {
      setIsChatListOpen(false);
    }
  }, [isMobile]);

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

  const toggleChatList = () => {
    setIsChatListOpen(!isChatListOpen);
  };

  if (!userId) {
    return (
      <div className="flex flex-col min-h-screen bg-white dark:bg-black">
        <Header />
        <div className="flex-1 flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-950">
          <p className="text-lg text-gray-600 dark:text-gray-400 text-center">Please log in to access chat</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (loading && chats.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-white dark:bg-black">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          {!isMobile && <ModernSidebar />}
          <div className="flex-1 flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-950">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-gray-900 dark:text-white" />
              <span className="text-lg text-gray-600 dark:text-gray-400">Loading conversations...</span>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black">
      <Header />
      <div className="flex flex-1 overflow-hidden relative">
        {/* Desktop Sidebar */}
        {!isMobile && <ModernSidebar />}

        {/* Mobile Sidebar Overlay */}
        {isMobile && isChatListOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setIsChatListOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 z-50 md:hidden">
              <ModernSidebar />
            </div>
          </>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden w-full">
          {/* Page Header */}
          <header className="flex h-14 sm:h-16 shrink-0 items-center gap-2 sm:gap-4 border-b border-gray-200 dark:border-gray-800 px-3 sm:px-4 lg:px-6 bg-white dark:bg-black w-full">
            <div className="flex items-center justify-between w-full gap-2">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                {isMobile && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleChatList}
                    className="shrink-0"
                  >
                    <MessageCircle className="h-5 w-5 text-gray-900 dark:text-white" />
                  </Button>
                )}
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                  My Conversations
                </h1>
                {totalUnreadCount > 0 && (
                  <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                    {totalUnreadCount} unread
                  </span>
                )}
              </div>
            </div>
          </header>

          {/* Scrollable Content */}
          <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950">
            <div className="flex flex-col gap-4 sm:gap-6 p-3 sm:p-4 lg:p-6">
              <div className={`flex flex-1 h-[calc(100vh-80px)] ${isMobile ? 'flex-col' : 'flex-row'}`}>
                <div
                  className={`
                    ${isMobile
                      ? `fixed inset-y-0 left-0 z-50 w-full transform transition-transform duration-300 ease-in-out ${isChatListOpen ? 'translate-x-0' : '-translate-x-full'}`
                      : 'w-80 border-r border-gray-200 dark:border-gray-800'}
                    bg-white dark:bg-black h-full
                  `}
                >
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
                <div className={`flex-1 flex flex-col h-full ${isMobile ? 'w-full' : ''}`}>
                  <ChatWindow
                    chat={selectedChat}
                    onOpenChatList={() => setIsChatListOpen(true)}
                    isMobile={isMobile}
                    userType="user"
                    userId={userId}
                  />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
};