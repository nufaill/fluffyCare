import { Avatar, AvatarFallback, AvatarImage } from '@/components/chat/ui/avatar';
import { Badge } from '@/components/chat/ui/badge';
import type { Chat } from '@/types/chat.type';
import { format, isToday, isYesterday } from 'date-fns';
import { ImageIcon, Video, Mic, Paperclip } from 'lucide-react';

interface ChatListItemProps {
  chat: Chat;
  isSelected: boolean;
  onClick: () => void;
  userType: 'user' | 'shop';
}

export function ChatListItem({ chat, isSelected, onClick, userType }: ChatListItemProps) {
  const formatTime = (date: Date | null) =>
    !date
      ? ''
      : isToday(date)
      ? format(date, 'HH:mm')
      : isYesterday(date)
      ? 'Yesterday'
      : format(date, 'MMM d');

  const getMessagePreview = () => {
    const icons = {
      Image: <ImageIcon className="h-3 w-3 mr-1" />,
      Video: <Video className="h-3 w-3 mr-1" />,
      Audio: <Mic className="h-3 w-3 mr-1" />,
      File: <Paperclip className="h-3 w-3 mr-1" />,
    };

    if (chat.lastMessageType !== 'Text') {
      return (
        <div className="flex items-center">
          {icons[chat.lastMessageType]}
          <span>
            {chat.lastMessageType === 'Image' && 'Photo'}
            {chat.lastMessageType === 'Video' && 'Video'}
            {chat.lastMessageType === 'Audio' && 'Voice message'}
            {chat.lastMessageType === 'File' && 'File'}
          </span>
        </div>
      );
    }
    return chat.lastMessage;
  };

  const otherParty = userType === 'user' ? chat.shop : chat.user;

  const getFallbackInitials = (name: string) => {
    if (!name) return 'NA';
    const words = name.trim().split(' ');
    return words.length > 1 ? `${words[0][0]}${words[1][0]}`.toUpperCase() : name.slice(0, 2).toUpperCase();
  };

  return (
    <div
      className={`
        p-4 border-b border-border cursor-pointer transition-all duration-200 hover:bg-accent/50
        ${isSelected ? 'bg-accent border-l-4 border-l-primary' : ''}
        ${chat.unreadCount > 0 ? 'bg-accent/20' : ''}
      `}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className="relative">
          <Avatar className="h-12 w-12">
            <AvatarImage src={otherParty.logo || otherParty.profileImage || '/placeholder.svg'} alt={otherParty.name || otherParty.fullName} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {getFallbackInitials(otherParty.name || otherParty.fullName || '')}
            </AvatarFallback>
          </Avatar>
          {parseInt(userType === 'user' ? chat.shopId.id : chat.userId.id) % 3 === 0 && (
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 border-2 border-background rounded-full" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex flex-col">
              <h3 className={`font-medium truncate ${chat.unreadCount > 0 ? 'text-foreground' : 'text-foreground'}`}>
                {otherParty.name || otherParty.fullName || 'Unknown'}
              </h3>
              {userType === 'user' && chat.shopId.city && (
                <span className="text-xs text-muted-foreground">{chat.shopId.city}</span>
              )}
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-xs text-muted-foreground">{formatTime(chat.lastMessageAt)}</span>
              {chat.unreadCount > 0 && (
                <Badge variant="default" className="h-5 min-w-5 text-xs bg-primary">
                  {chat.unreadCount}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center">
            <p
              className={`text-sm truncate flex-1 ${
                chat.unreadCount > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'
              }`}
            >
              {getMessagePreview()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}