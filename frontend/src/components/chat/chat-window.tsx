"use client"

import { MessageCircle } from "lucide-react"
import { ChatHeader } from "./chat-header"
import { MessageList } from "./message-list"
import { ChatInput } from "./chat-input"
import { useMessages } from "@/hooks/chat/useMessages"
import type { Chat } from "@/types/chat"
import React from "react"

interface ChatWindowProps {
  chat: Chat | null
  onOpenChatList: () => void
  isMobile: boolean
  userType: "user" | "shop"
  currentUserId?: string
}

export function ChatWindow({ 
  chat, 
  onOpenChatList, 
  isMobile, 
  userType, 
  currentUserId 
}: ChatWindowProps) {
  const chatId = chat ? `${chat.userId}-${chat.shopId}` : "";
  
  const {
    messages,
    loading: messagesLoading,
    sendMessage,
    addReaction,
    removeReaction,
    markMessagesAsRead,
    deleteMessage,
  } = useMessages({
    chatId,
    autoRefresh: true,
    refreshInterval: 5000, // Refresh every 5 seconds
  });

  const handleSendMessage = async (content: string, attachments: any[]) => {
    if (!chat || !currentUserId) return;

    const senderRole = userType === "user" ? "User" : "Shop";
    
    // Handle text message
    if (content.trim()) {
      await sendMessage(senderRole, "Text", content.trim());
    }

    // Handle attachments
    for (const attachment of attachments) {
      let messageType: "Image" | "Video" | "Audio" | "File" = "File";
      
      switch (attachment.type) {
        case "image":
          messageType = "Image";
          break;
        case "video":
          messageType = "Video";
          break;
        case "audio":
          messageType = "Audio";
          break;
        default:
          messageType = "File";
      }

      // In a real app, you'd upload the file first and get a URL
      const mediaUrl = attachment.preview || attachment.file.name;
      const messageContent = attachment.file.name;
      
      await sendMessage(senderRole, messageType, messageContent, mediaUrl);
    }
  };

  const handleReactionAdd = async (messageId: string, emoji: string) => {
    if (!currentUserId) return;
    await addReaction(messageId, currentUserId, emoji);
  };

  const handleReactionRemove = async (messageId: string, emoji: string) => {
    if (!currentUserId) return;
    await removeReaction(messageId, currentUserId);
  };

  // Mark messages as read when chat opens
  React.useEffect(() => {
    if (chat && currentUserId && messages.length > 0) {
      const receiverRole = userType === "user" ? "User" : "Shop";
      const unreadMessages = messages
        .filter(msg => !msg.isRead && msg.senderRole !== receiverRole)
        .map(msg => msg.chatId);
      
      if (unreadMessages.length > 0) {
        markMessagesAsRead(receiverRole, unreadMessages);
      }
    }
  }, [chat, currentUserId, messages, markMessagesAsRead, userType]);

  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <MessageCircle className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">Select a conversation</h3>
          <p className="text-muted-foreground">Choose a chat from the sidebar to start messaging</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Header */}
      <ChatHeader 
        chat={chat} 
        onOpenChatList={onOpenChatList} 
        isMobile={isMobile} 
        userType={userType} 
      />

      {/* Messages Area */}
      <MessageList 
        messages={messages} 
        currentUserId={currentUserId || ""}
        userType={userType}
        loading={messagesLoading}
        onReactionAdd={handleReactionAdd}
        onReactionRemove={handleReactionRemove}
        onDeleteMessage={deleteMessage}
      />

      {/* Chat Input */}
      <ChatInput onSendMessage={handleSendMessage} />
    </div>
  )
}