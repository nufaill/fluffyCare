// reaction-picker.tsx
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/chat/ui/popover';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';

interface ReactionPickerProps {
  onReactionSelect: (emoji: string) => void;
  currentReaction?: string;
  trigger?: React.ReactNode;
}

const quickReactions = ['❤️', '👍', '😂', '😢', '😮', '😡', '🎉', '🔥'];

const allReactions = {
  Popular: ['❤️', '👍', '👎', '😂', '😢', '😮', '😡', '🎉', '🔥', '💯', '👏', '🙏'],
  Smileys: [
    '😀',
    '😃',
    '😄',
    '😁',
    '😆',
    '😅',
    '😂',
    '🤣',
    '😊',
    '😇',
    '🙂',
    '🙃',
    '😉',
    '😌',
    '😍',
    '🥰',
    '😘',
    '😗',
    '😙',
    '😚',
    '😋',
    '😛',
    '😝',
    '😜',
  ],
  Animals: [
    '🐶',
    '🐱',
    '🐭',
    '🐹',
    '🐰',
    '🦊',
    '🐻',
    '🐼',
    '🐨',
    '🐯',
    '🦁',
    '🐮',
    '🐷',
    '🐸',
    '🐵',
    '🐔',
    '🐧',
    '🐦',
    '🐤',
    '🐣',
    '🐥',
    '🦆',
  ],
  Hearts: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝'],
};

export function ReactionPicker({ onReactionSelect, currentReaction, trigger }: ReactionPickerProps) {
  const isSelected = (emoji: string) => emoji === currentReaction;

  return (
    <Popover>
      <PopoverTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <Plus className="h-3 w-3" />
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="center" sideOffset={8}>
        <div className="p-3 border-b border-border">
          <div className="flex gap-1 justify-center">
            {quickReactions.map((emoji) => (
              <motion.div key={emoji} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`h-8 w-8 p-0 text-lg hover:bg-accent ${isSelected(emoji) ? 'bg-primary text-primary-foreground' : ''}`} 
                  onClick={() => onReactionSelect(emoji)}
                >
                  {emoji}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="p-3 max-h-48 overflow-y-auto">
          {Object.entries(allReactions).map(([category, emojis]) => (
            <div key={category} className="mb-3">
              <h4 className="text-xs font-medium text-muted-foreground mb-2">{category}</h4>
              <div className="grid grid-cols-8 gap-1">
                {emojis.map((emoji) => (
                  <motion.div key={emoji} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={`h-6 w-6 p-0 text-sm hover:bg-accent ${isSelected(emoji) ? 'bg-primary text-primary-foreground' : ''}`} 
                      onClick={() => onReactionSelect(emoji)}
                    >
                      {emoji}
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}