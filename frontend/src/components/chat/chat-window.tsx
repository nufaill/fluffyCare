// chat-window.tsx
import { useEffect, useCallback, useState } from "react";
import { MessageCircle } from "lucide-react";
import { ChatHeader } from "./chat-header";
import { MessageList } from "./message-list";
import { ChatInput } from "./chat-input";
import { useMessages } from "@/hooks/chat/useMessages";
import { chatService } from "@/services/chat/chatService";
import { cloudinaryUtils } from "@/utils/cloudinary/cloudinary";
import { useToast } from "@/hooks/use-toast";
import { connectSocket, disconnectSocket, joinChat, leaveChat, sendTyping, stopTyping, isSocketConnected, getSocket } from '@/components/shared/socket.io-client';
import type { Chat } from "@/types/chat.type";

interface FileAttachment {
  id: string;
  file: File;
  type: "image" | "video" | "audio" | "document";
}

interface ChatWindowProps {
  chat: Chat | null;
  onOpenChatList: () => void;
  isMobile: boolean;
  userType: "user" | "shop";
  userId?: string;
}

export function ChatWindow({ chat, onOpenChatList, isMobile, userType, userId }: ChatWindowProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);

  const chatId = chat?._id || chat?.id || "";
  const currentUserId = userId || (userType === "user" ? chat?.userId : chat?.shopId) || "";
  const currentRole = userType === "user" ? "User" : "Shop";
  const isValidChat = !!chatId && typeof chatId === "string";

  const { messages, sending, error, sendMessage, addReaction, removeReaction, markMessagesAsRead, deleteMessage } = useMessages({
    chatId,
    userId: currentUserId,
    currentRole,
    autoRefresh: false,
    refreshInterval: 15000,
  });

  useEffect(() => {
    let mounted = true;

    const initializeSocket = async () => {
      if (!mounted) return;
      try {
        await connectSocket(currentUserId, currentRole);
        console.log('[ChatWindow] Socket connected:', isSocketConnected());
        if (mounted) setSocketConnected(isSocketConnected());
      } catch (error: any) {
        console.error('[ChatWindow] Socket initialization failed:', error.message);
        setSocketConnected(false);
        toast({ title: "Connection Failed", description: error.message || "Failed to connect to chat server.", variant: "destructive" });
      }
    };

    initializeSocket();

    return () => {
      mounted = false;
      disconnectSocket();
      setSocketConnected(false);
    };
  }, [toast, currentUserId, currentRole]);

  useEffect(() => {
    if (!isValidChat || !currentUserId || !socketConnected) return;

    console.log(`[ChatWindow] Joining chat ${chatId} as ${currentRole} (${currentUserId})`);
    joinChat(chatId, currentUserId, currentRole);
    return () => {
      console.log(`[ChatWindow] Leaving chat ${chatId}`);
      leaveChat(chatId, currentUserId);
    };
  }, [socketConnected, chatId, currentUserId, currentRole, isValidChat]);

  const uploadFile = async (file: File): Promise<string> => {
    setIsUploading(true);
    try {
      if (typeof cloudinaryUtils?.uploadImage === "function") {
        return await cloudinaryUtils.uploadImage(file);
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
      return `mock-url-${file.name}`;
    } catch {
      throw new Error("Failed to upload file.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendMessage = useCallback(async (content: string, attachments: FileAttachment[]) => {
    if (!chat || !currentUserId || !isValidChat) {
      toast({ title: "Error", description: "Invalid chat configuration", variant: "destructive" });
      return;
    }

    const senderRole = userType === "user" ? "User" : "Shop";
    let messagesSent = 0;

    try {
      if (content.trim()) {
        const textMessage = await sendMessage(senderRole, "Text", content.trim());
        if (textMessage) {
          messagesSent++;
          await Promise.all([
            chatService.updateLastMessage(chatId, content.trim(), "Text").catch(() => { }),
            chatService.incrementUnreadCount(chatId).catch(() => { })
          ]);
        }
      }

      for (const attachment of attachments) {
        const messageType = attachment.type === "document" ? "File" : attachment.type.charAt(0).toUpperCase() + attachment.type.slice(1) as "Image" | "Video" | "Audio" | "File";
        let mediaUrl = attachment.file.name;

        try {
          if (["Image", "Video", "Audio"].includes(messageType)) {
            mediaUrl = await uploadFile(attachment.file);
          }
          const attachmentMessage = await sendMessage(senderRole, messageType, "", mediaUrl);
          if (attachmentMessage) {
            messagesSent++;
            await chatService.updateLastMessage(chatId, `Sent a ${messageType.toLowerCase()}`, messageType).catch(() => { });
          }
        } catch (err) {
          toast({ title: "Upload Failed", description: `Failed to send ${attachment.file.name}`, variant: "destructive" });
        }
      }

      if (messagesSent > 0) {
        toast({ description: `${messagesSent} message${messagesSent > 1 ? "s" : ""} sent successfully` });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to send message.", variant: "destructive" });
    }
  }, [chat, currentUserId, userType, sendMessage, chatId, isValidChat, toast]);

  // Reactions
  const handleReactionAdd = useCallback(async (messageId: string, emoji: string) => {
    if (!currentUserId) return;
    try {
      await addReaction(messageId, emoji);
      if (socketConnected && isValidChat) {
        getSocket().emit('reaction-added', {
          chatId,
          messageId,
          userId: currentUserId,
          emoji,
          timestamp: new Date().toISOString()
        });
      }
    } catch {
      toast({ title: "Error", description: "Failed to add reaction", variant: "destructive" });
    }
  }, [currentUserId, addReaction, socketConnected, isValidChat, chatId, toast]);

  const handleReactionRemove = useCallback(async (messageId: string, emoji: string) => {
    if (!currentUserId) return;
    try {
      await removeReaction(messageId, emoji);
      if (socketConnected && isValidChat) {
        getSocket().emit('reaction-removed', {
          chatId,
          messageId,
          userId: currentUserId,
          emoji,
          timestamp: new Date().toISOString()
        });
      }
    } catch {
      toast({ title: "Error", description: "Failed to remove reaction", variant: "destructive" });
    }
  }, [currentUserId, removeReaction, socketConnected, isValidChat, chatId, toast]);

  // Delete message
  const handleDeleteMessage = useCallback(async (messageId: string) => {
    try {
      await deleteMessage(messageId);
      toast({ description: "Message deleted successfully" });
    } catch {
      toast({ title: "Error", description: "Failed to delete message", variant: "destructive" });
    }
  }, [deleteMessage, toast]);

  // Copy message
  const handleCopy = useCallback((content: string) => {
    navigator.clipboard.writeText(content)
      .then(() => toast({ description: "Message copied to clipboard" }))
      .catch(() => toast({ title: "Error", description: "Failed to copy message", variant: "destructive" }));
  }, [toast]);

  // Typing indicators
  const handleTypingStart = useCallback(() => {
    if (socketConnected && isValidChat && currentUserId) {
      sendTyping(chatId, currentUserId, currentRole);
    }
  }, [socketConnected, isValidChat, chatId, currentUserId, currentRole]);

  const handleTypingStop = useCallback(() => {
    if (socketConnected && isValidChat && currentUserId) {
      stopTyping(chatId, currentUserId, currentRole);
    }
  }, [socketConnected, isValidChat, chatId, currentUserId, currentRole]);

  // Mark messages as read
  useEffect(() => {
    if (!chat || !currentUserId || !messages.length || !isValidChat) return;

    const receiverRole = userType === "user" ? "User" : "Shop";
    const unreadMessages = messages.filter(msg => msg.senderRole !== receiverRole && !msg.isRead);
    if (unreadMessages.length) {
      const messageIds = unreadMessages.map(msg => msg._id || "").filter(Boolean);
      markMessagesAsRead(messageIds, receiverRole);
      chatService.resetUnreadCount(chatId).catch(() => { });

      // Emit read events for real-time updates
      if (socketConnected) {
        const readAt = new Date().toISOString();
        messageIds.forEach(id => {
          getSocket().emit('message-read', {
            chatId,
            messageId: id,
            readAt,
            receiverRole
          });
        });
      }
    }
  }, [chat, currentUserId, messages, markMessagesAsRead, userType, chatId, isValidChat, socketConnected]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast({ title: "Error", description: error, variant: "destructive" });
    }
  }, [error, toast]);

  // Invalid/no chat handling
  if (!chat || !isValidChat) {
    return (
      <div className={`flex-1 flex items-center justify-center bg-background ${isMobile ? 'p-4' : ''}`}>
        <div className="text-center max-w-md w-full">
          <div className={`w-24 h-24 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center ${isMobile ? 'w-16 h-16' : ''}`}>
            <MessageCircle className={`h-8 w-8 text-muted-foreground ${isMobile ? 'h-6 w-6' : ''}`} />
          </div>
          <h3 className={`text-lg font-medium text-foreground mb-2 ${isMobile ? 'text-base' : ''}`}>{chat ? "Invalid Chat" : "Select a conversation"}</h3>
          <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>{chat ? "This chat has an invalid configuration." : "Choose a chat from the sidebar to start messaging"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-background h-full relative md:h-[calc(100vh-80px)]">
      <ChatHeader
        chat={chat}
        onOpenChatList={onOpenChatList}
        isMobile={isMobile}
        userType={userType}
      />
      <MessageList
        messages={messages}
        currentUserId={currentUserId}
        userType={userType}
        onReactionAdd={handleReactionAdd}
        onReactionRemove={handleReactionRemove}
        onDeleteMessage={handleDeleteMessage}
        onCopy={handleCopy}
      />
      <ChatInput
        onSendMessage={handleSendMessage}
        onTypingStart={handleTypingStart}
        onTypingStop={handleTypingStop}
        disabled={sending || isUploading || !chat || !isValidChat}
      />
      <div className={`absolute bottom-4 right-4 flex flex-col gap-2 z-10 ${isMobile ? 'bottom-20 right-2' : ''}`}>
        {(sending || isUploading) && (
          <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm shadow-lg">
            {isUploading ? "Uploading..." : "Sending..."}
          </div>
        )}
      </div>
    </div>
  );
}