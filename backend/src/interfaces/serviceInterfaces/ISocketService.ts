// ISocketService.ts
export interface ISocketService {
  emitNewMessage(data: any): void;
  emitMessageStatus(data: any): void;
  emitMessageReaction(data: any): void;
  emitChatUpdate(chatId: string, updateData: any): void;
  emitUnreadCountUpdate(userId: string, unreadCount: number): void;
  emitUserOnlineStatus(userId: string, isOnline: boolean): void;
  isUserOnline(userId: string): boolean;
  getOnlineUsers(): string[];
}

// IValidationService.ts
export interface IValidationService {
  validateObjectId(id: string, fieldName: string): void;
  validatePaginationParams(page: number, limit: number): void;
  validateMessageType(messageType: string): boolean;
  validateRole(role: string): boolean;
  validateRequiredFields(fields: Record<string, any>): void;
}

// IErrorHandler.ts
export interface IErrorHandler {
  handleServiceError(error: unknown, operation: string): never;
  logError(error: unknown, context: string): void;
  createError(message: string, statusCode?: number): Error;
}