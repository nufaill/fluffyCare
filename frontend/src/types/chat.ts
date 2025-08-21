
export interface Chat {
  userId: string;
  shopId: string;
  lastMessage: string
  lastMessageType: "Text" | "Image" | "Video" | "Audio" | "File"
  lastMessageAt: Date | null
  unreadCount: number
  createdAt?: Date
  updatedAt?: Date
}

export interface ChatDocument extends Chat, Document {}
