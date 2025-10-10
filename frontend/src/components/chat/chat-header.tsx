import { Avatar, AvatarFallback, AvatarImage } from '@/components/chat/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Menu, MoreVertical, Phone, Video, Info } from 'lucide-react';
import type { Chat } from '@/types/chat.type';
import { cloudinaryUtils } from '@/utils/cloudinary/cloudinary';

interface ChatHeaderProps {
  chat: Chat;
  onOpenChatList: () => void;
  isMobile: boolean;
  userType: 'user' | 'shop';
}

export function ChatHeader({ chat, onOpenChatList, isMobile, userType }: ChatHeaderProps) {
  const getFallbackInitials = (name: string) => {
    if (!name) return 'NA';
    const words = name.trim().split(' ');
    return words.length > 1 ? `${words[0][0]}${words[1][0]}`.toUpperCase() : name.slice(0, 2).toUpperCase();
  };

  let displayName: string;
  let imageSrc: string;
  let isOnline: boolean;
  let secondaryInfo: string;

  if (userType === 'user') {
    const party = chat.shop;
    displayName = party?.name || 'Unknown';
    imageSrc = party?.logo ? cloudinaryUtils.getFullUrl(party.logo) : '/placeholder.svg';
    isOnline = party?.id ? parseInt(party.id) % 3 === 0 : false;
    secondaryInfo = party?.phone ? party.phone.toString() : 'No phone';
  } else {
    const party = chat.user;
    displayName = party?.fullName || 'Unknown';
    imageSrc = party?.profileImage ? cloudinaryUtils.getFullUrl(party.profileImage) : '/placeholder.svg';
    isOnline = party?.id ? parseInt(party.id) % 3 === 0 : false;
    secondaryInfo = party?.phone ? party.phone.toString() : 'No phone';
  }

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
                <AvatarImage src={imageSrc} alt={displayName} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getFallbackInitials(displayName)}
                </AvatarFallback>
              </Avatar>
              {isOnline && (
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 border-2 border-background rounded-full" />
              )}
            </div>
            <div>
              <h2 className="font-medium text-foreground"> {displayName}</h2>
              <p className="text-sm text-muted-foreground">
                {isOnline ? 'Online' : 'Last seen recently'} • {secondaryInfo}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}