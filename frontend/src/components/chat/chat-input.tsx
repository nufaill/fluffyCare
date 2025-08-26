import { useState, useRef, useCallback, useEffect } from 'react';
import { Send, Paperclip, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface FileAttachment {
  id: string;
  file: File;
  preview?: string;
  type: "image" | "video" | "audio" | "document";
}

interface ChatInputProps {
  onSendMessage: (content: string, attachments: FileAttachment[]) => void;
  disabled?: boolean;
  placeholder?: string;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
  className?: string;
}

export function ChatInput({
  onSendMessage,
  disabled = false,
  placeholder = "Type a message...",
  onTypingStart,
  onTypingStop,
  className
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle typing indicators
  const handleTypingStart = useCallback(() => {
    if (!isTyping && onTypingStart) {
      setIsTyping(true);
      onTypingStart();
    }
    
    // Reset typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      if (onTypingStop) {
        setIsTyping(false);
        onTypingStop();
      }
    }, 3000);
  }, [isTyping, onTypingStart, onTypingStop]);

  const handleTypingStop = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    
    if (isTyping && onTypingStop) {
      setIsTyping(false);
      onTypingStop();
    }
  }, [isTyping, onTypingStop]);

  // Handle message input changes
  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);
    
    if (value.trim()) {
      handleTypingStart();
    } else {
      handleTypingStop();
    }
  };

  // Handle sending messages
  const handleSend = useCallback(() => {
    if (disabled) return;
    
    const trimmedMessage = message.trim();
    if (!trimmedMessage && attachments.length === 0) return;
    
    // Stop typing before sending
    handleTypingStop();
    
    onSendMessage(trimmedMessage, attachments);
    setMessage('');
    setAttachments([]);
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [message, attachments, disabled, onSendMessage, handleTypingStop]);

  // Handle key press for sending
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    files.forEach((file) => {
      const fileType = getFileType(file);
      const id = Math.random().toString(36).substring(7);
      
      const attachment: FileAttachment = {
        id,
        file,
        type: fileType,
      };
      
      // Create preview for images
      if (fileType === 'image') {
        const reader = new FileReader();
        reader.onload = (event) => {
          setAttachments(prev => 
            prev.map(att => 
              att.id === id 
                ? { ...att, preview: event.target?.result as string }
                : att
            )
          );
        };
        reader.readAsDataURL(file);
      }
      
      setAttachments(prev => [...prev, attachment]);
    });
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Get file type based on file extension/type
  const getFileType = (file: File): FileAttachment['type'] => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    return 'document';
  };

  // Remove attachment
  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={cn("border-t border-border bg-background p-4", className)}>
      {/* File Attachments */}
      {attachments.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="relative flex items-center gap-2 bg-muted rounded-lg p-2 max-w-xs"
            >
              {attachment.preview ? (
                <img
                  src={attachment.preview}
                  alt={attachment.file.name}
                  className="w-10 h-10 object-cover rounded"
                />
              ) : (
                <div className="w-10 h-10 bg-muted-foreground/20 rounded flex items-center justify-center">
                  <Paperclip className="h-4 w-4" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{attachment.file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(attachment.file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => removeAttachment(attachment.id)}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleMessageChange}
            onKeyDown={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="min-h-[40px] max-h-[120px] resize-none"
          />
        </div>

        {/* File Upload Button */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => fileInputRef.current?.click()}
          className="h-10 w-10 p-0"
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        {/* Send Button */}
        <Button
          onClick={handleSend}
          disabled={disabled || (!message.trim() && attachments.length === 0)}
          size="sm"
          className="h-10 w-10 p-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}