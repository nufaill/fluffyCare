import { Avatar, AvatarFallback, AvatarImage } from '@/components/chat/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Menu, MoreVertical, Phone, Video, Info } from 'lucide-react';
import type { Chat } from '@/types/chat.type';

interface ChatHeaderProps {
  chat: Chat;
  onOpenChatList: () => void;
  isMobile: boolean;
  userType: 'user' | 'shop';
}

export function ChatHeader({ chat, onOpenChatList, isMobile, userType }: ChatHeaderProps) {
  const otherParty = userType === 'user' ? chat.shop : chat.user;
  const isOnline = parseInt(userType === 'user' ? chat.shop : chat.user) % 3 === 0;
  const secondaryInfo = userType === 'user' ? chat.shop.city : chat.user.phone || chat.user.email;

  const getFallbackInitials = (name: string) => {
    if (!name) return 'NA';
    const words = name.trim().split(' ');
    return words.length > 1 ? `${words[0][0]}${words[1][0]}`.toUpperCase() : name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="p-4 border-b border-border bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isMobile && (
            <Button variant="ghost" size="sm" onClick={onOpenChatList}>
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarImage src={chat.shopId.logo || '/placeholder.svg'} alt={otherParty?.name || otherParty?.fullName} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getFallbackInitials(otherParty?.name || otherParty?.fullName || '')}
                </AvatarFallback>
              </Avatar>
              {isOnline && (
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 border-2 border-background rounded-full" />
              )}
            </div>
            <div>
              <h2 className="font-medium text-foreground"> {otherParty?.name || otherParty?.fullName || 'Unknown'}</h2>
              <p className="text-sm text-muted-foreground">
                {isOnline ? 'Online' : 'Last seen recently'} • {secondaryInfo || 'No info'}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Video className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Info className="h-4 w-4 mr-2" />
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem>Clear Chat</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Block User</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}