export interface Reaction {
  userId: string;
  emoji: string
  reactedAt: Date
}

export interface Message {
  chatId: string;
  senderRole: "User" | "Shop"
  messageType: "Text" | "Image" | "Video" | "Audio" | "File"
  content: string
  mediaUrl: string
  isRead: boolean
  deliveredAt?: Date
  readAt?: Date
  reactions: Reaction[]
  createdAt?: Date
  updatedAt?: Date
}

export interface MessageDocument extends Message, Document {}
