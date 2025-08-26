import { useEffect, useRef, useState, useCallback } from 'react';
import { MessageBubble } from './message-bubble';
import type { Message } from '@/types/message.type';
import { format, isSameDay } from 'date-fns';
import { MessageCircle, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { extractId } from '@/utils/helpers/chatHelpers';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  userType: 'user' | 'shop';
  onReactionAdd: (messageId: string, emoji: string) => void;
  onReactionRemove: (messageId: string, emoji: string) => void;
  onReply?: (message: Message) => void;
  onEdit?: (message: Message) => void;
  onDelete?: (message: Message) => void;
  onDeleteMessage?: (messageId: string) => void;
  onForward?: (message: Message) => void;
  onCopy?: (content: string) => void;
  onReport?: (message: Message) => void;
}

export function MessageList({
  messages,
  currentUserId,
  userType,
  onReactionAdd,
  onReactionRemove,
  onReply,
  onEdit,
  onDelete,
  onDeleteMessage,
  onForward,
  onCopy,
  onReport,
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);

  const scrollToBottom = useCallback((smooth: boolean = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant', block: 'end' });
  }, []);

  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const nearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setIsNearBottom(nearBottom);
    setShowScrollButton(!nearBottom && messages.length > 0);
  }, [messages.length]);

  useEffect(() => {
    if (messages.length > 0 && isNearBottom) {
      scrollToBottom();
    }
  }, [messages, isNearBottom, scrollToBottom]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => scrollToBottom(false), 100);
    }
  }, [scrollToBottom]);

  const shouldShowAvatar = useCallback(
    (message: Message, index: number) => {
      const isOwn = userType === 'user' ? message.senderRole === 'User' : message.senderRole === 'Shop';
      if (isOwn) return false;
      const nextMessage = messages[index + 1];
      return !nextMessage || nextMessage.senderRole !== message.senderRole;
    },
    [userType, messages],
  );

  const shouldShowDateSeparator = useCallback(
    (message: Message, index: number) => {
      if (index === 0) return true;
      const prevMessage = messages[index - 1];
      if (!prevMessage.createdAt || !message.createdAt) return false;
      return !isSameDay(new Date(prevMessage.createdAt), new Date(message.createdAt));
    },
    [messages],
  );

  const handleDelete = useCallback((message: Message) => {
    const messageId = extractId(message._id || message.id);
    if (onDeleteMessage) {
      onDeleteMessage(messageId);
    } else if (onDelete) {
      onDelete(message);
    }
  }, [onDeleteMessage, onDelete]);

  const handleCopy = useCallback((content: string) => {
    if (onCopy) {
      onCopy(content);
    } else {
      // Fallback copy functionality
      navigator.clipboard.writeText(content).catch(console.error);
    }
  }, [onCopy]);

  // Generate a stable key for each message
  const generateMessageKey = useCallback((message: Message, index: number): string => {
    try {
      const messageId = extractId(message._id || message.id);

      if (messageId && messageId !== '[object Object]') {
        return messageId;
      }

      // Fallback to chatId if available
      const chatId = extractId(message.chatId);
      if (chatId && chatId !== '[object Object]') {
        // Use chatId + timestamp + index as fallback
        const timestamp = message.createdAt ? new Date(message.createdAt).getTime() : Date.now();
        return `${chatId}-${timestamp}-${index}`;
      }

      // Final fallback: use content hash + index
      const contentHash = message.content ?
        message.content.slice(0, 10).replace(/[^a-zA-Z0-9]/g, '') :
        'empty';
      const timestamp = message.createdAt ? new Date(message.createdAt).getTime() : Date.now();
      return `msg-${contentHash}-${timestamp}-${index}`;

    } catch (error) {
      console.warn('Error generating message key:', error);
      return `fallback-${index}-${Date.now()}`;
    }
  }, []);

  // Debug logging
  useEffect(() => {
    console.log('MessageList: messages updated', {
      count: messages.length,
      messages: messages.slice(0, 3).map(m => ({
        id: m._id,
        content: m.content?.slice(0, 20) + '...',
        sender: m.senderRole
      }))
    });

    // Check for corrupted message IDs
    const corruptedMessages = messages.filter(m => {
      const id = extractId(m._id);
      return id === '[object Object]' || id.includes('[object Object]');
    });

    if (corruptedMessages.length > 0) {
      console.error(`Found ${corruptedMessages.length} messages with corrupted IDs:`, corruptedMessages);
    }
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <MessageCircle className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-sm font-medium text-foreground mb-2">No messages yet</h3>
          <p className="text-xs text-muted-foreground">Start the conversation by sending a message</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 relative h-full">
      <div
        ref={messagesContainerRef}
        className="h-full overflow-y-auto p-4 space-y-1 scroll-smooth"
        style={{ maxHeight: 'calc(100vh - 200px)' }}
        onScroll={handleScroll}
      >
        {messages.map((message, index) => {
          const isOwn = userType === 'user' ? message.senderRole === 'User' : message.senderRole === 'Shop';
          const showAvatar = shouldShowAvatar(message, index);
          const showDateSeparator = shouldShowDateSeparator(message, index);
          const messageKey = generateMessageKey(message, index);


          return (
            <div key={messageKey}>
              {showDateSeparator && message.createdAt && (
                <div className="flex items-center justify-center my-4">
                  <div className="bg-muted px-3 py-1 rounded-full">
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(message.createdAt), 'MMMM d, yyyy')}
                    </span>
                  </div>
                </div>
              )}
              <MessageBubble
                message={message}
                isOwn={isOwn}
                showAvatar={showAvatar}
                onReactionAdd={(messageId, emoji) => {
                  const cleanId = extractId(messageId);
                  if (cleanId && cleanId !== '[object Object]') {
                    onReactionAdd(cleanId, emoji);
                  } else {
                    console.error('Cannot add reaction - invalid message ID:', messageId);
                  }
                }}
                onReactionRemove={(messageId, emoji) => onReactionRemove(extractId(messageId), emoji)}
                onReply={() => { }}
                onEdit={() => { }}
                onDelete={handleDelete}
                onForward={() => { }}
                onCopy={handleCopy}
                onReport={() => { }}
              />
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {showScrollButton && (
        <Button
          onClick={() => scrollToBottom()}
          className="absolute bottom-4 right-4 rounded-full h-10 w-10 p-0 shadow-lg z-10"
          variant="secondary"
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}