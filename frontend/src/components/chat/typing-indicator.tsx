// components/chat/typing-indicator.tsx
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface TypingIndicatorProps {
  typingUsers: string[];
  className?: string;
}

export function TypingIndicator({ typingUsers, className }: TypingIndicatorProps) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  if (typingUsers.length === 0) return null;

  const getTypingText = () => {
    if (typingUsers.length === 1) {
      return `Someone is typing${dots}`;
    }
    if (typingUsers.length === 2) {
      return `2 people are typing${dots}`;
    }
    return `${typingUsers.length} people are typing${dots}`;
  };

  return (
    <div className={cn('flex items-center text-sm text-muted-foreground', className)}>
      <div className="flex space-x-1 mr-2">
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span>{getTypingText()}</span>
    </div>
  );
}