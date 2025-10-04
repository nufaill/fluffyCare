// socket.io-handler.ts 
import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';

interface SlotBookedData {
  shopId: string;
  staffId: string;
  date: string;
  startTime: string;
  endTime: string;
  appointmentId: string;
  userId: string;
}

interface SlotCanceledData {
  shopId: string;
  staffId: string;
  date: string;
  startTime: string;
  endTime: string;
  appointmentId: string;
}

interface NewMessageData {
  chatId: string;
  messageId: string;
  senderId: string;
  senderRole: 'User' | 'Shop';
  receiverId: string;
  messageType: 'Text' | 'Image' | 'Video' | 'Audio' | 'File';
  content?: string;
  mediaUrl?: string;
  timestamp: string;
}

interface MessageStatusData {
  messageId: string;
  chatId: string | object;
  status: 'delivered' | 'read';
  timestamp: string;
  userId: string;
}

interface ReactionData {
  messageId: string;
  chatId: string | object;
  userId: string;
  emoji: string;
  action: 'add' | 'remove';
  timestamp: string;
}

interface TypingData {
  chatId: string;
  userId: string;
  userRole: 'User' | 'Shop';
  isTyping: boolean;
}

interface UserConnection {
  userId: string;
  userRole: 'User' | 'Shop';
  socketId: string;
}

export class SocketHandler {
  private io: SocketIOServer;
  private userConnections: Map<string, UserConnection[]> = new Map();

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket: Socket) => {

      socket.on('authenticate-user', (data: { userId: string; userRole: 'User' | 'Shop' }) => {
        if (data.userId && data.userRole) {
          this.addUserConnection(data.userId, data.userRole, socket.id);
          socket.userId = data.userId;
          socket.userRole = data.userRole;
        }
      });

      socket.on('join-chat', (chatId: string | { chatId: string }) => {
        let roomId: string;
        if (typeof chatId === 'string') {
          roomId = chatId;
        } else if (typeof chatId === 'object' && chatId.chatId) {
          roomId = chatId.chatId;
          console.warn(`Received object for chatId, extracted string: ${roomId}`);
        } else {
          console.error(`Invalid chatId format: ${JSON.stringify(chatId)}`);
          return;
        }
        socket.join(`chat-${roomId}`);
      });

      socket.on('leave-chat', (chatId: string) => {
        if (chatId) {
          socket.leave(`chat-${chatId}`);
        }
      });

      socket.on('join-shop', (shopId: string) => {
        if (shopId) {
          socket.join(`shop-${shopId}`);
        }
      });

      socket.on('leave-shop', (shopId: string) => {
        if (shopId) {
          socket.leave(`shop-${shopId}`);
        }
      });

      socket.on('typing-start', (data: { chatId: string }) => {
        if (socket.userId && socket.userRole && data.chatId) {
          socket.to(`chat-${data.chatId}`).emit('user-typing', {
            chatId: data.chatId,
            userId: socket.userId,
            userRole: socket.userRole,
            isTyping: true
          });
        }
      });

      socket.on('typing-stop', (data: { chatId: string }) => {
        if (socket.userId && socket.userRole && data.chatId) {
          socket.to(`chat-${data.chatId}`).emit('user-typing', {
            chatId: data.chatId,
            userId: socket.userId,
            userRole: socket.userRole,
            isTyping: false
          });
        }
      });

      socket.on('disconnect', () => {
        if (socket.userId) {
          this.removeUserConnection(socket.userId, socket.id);
        }
      });
    });
  }

  // User connection management
  private addUserConnection(userId: string, userRole: 'User' | 'Shop', socketId: string): void {
    const connections = this.userConnections.get(userId) || [];
    connections.push({ userId, userRole, socketId });
    this.userConnections.set(userId, connections);
  }

  private removeUserConnection(userId: string, socketId: string): void {
    const connections = this.userConnections.get(userId) || [];
    const filteredConnections = connections.filter(conn => conn.socketId !== socketId);

    if (filteredConnections.length === 0) {
      this.userConnections.delete(userId);
    } else {
      this.userConnections.set(userId, filteredConnections);
    }
  }

  private getUserSockets(userId: string): string[] {
    const connections = this.userConnections.get(userId) || [];
    return connections.map(conn => conn.socketId);
  }

  public emitSlotBooked(data: SlotBookedData): void {
    this.io.to(`shop-${data.shopId}`).emit('slot-booked', {
      shopId: data.shopId,
      staffId: data.staffId,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      appointmentId: data.appointmentId,
      timestamp: new Date().toISOString()
    });
  }

  public emitSlotCanceled(data: SlotCanceledData): void {
    this.io.to(`shop-${data.shopId}`).emit('slot-canceled', {
      shopId: data.shopId,
      staffId: data.staffId,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      appointmentId: data.appointmentId,
      timestamp: new Date().toISOString()
    });
  }

  public emitNewMessage(data: NewMessageData): void {
    this.io.to(`chat-${data.chatId}`).emit('new-message', data);

    const receiverSockets = this.getUserSockets(data.receiverId);
    receiverSockets.forEach(socketId => {
      this.io.to(socketId).emit('message-notification', {
        chatId: data.chatId,
        messageId: data.messageId,
        senderId: data.senderId,
        senderRole: data.senderRole,
        messageType: data.messageType,
        content: data.content,
        timestamp: data.timestamp
      });
    });
  }

  public emitMessageStatus(data: MessageStatusData): void {
    this.io.to(`chat-${data.chatId}`).emit('message-status-update', data);
  }

  public emitMessageReaction(data: ReactionData): void {
    this.io.to(`chat-${data.chatId}`).emit('message-reaction', data);
  }

  public emitChatUpdate(chatId: string, updateData: any): void {
    this.io.to(`chat-${chatId}`).emit('chat-updated', {
      chatId,
      ...updateData,
      timestamp: new Date().toISOString()
    });
  }

  public emitUnreadCountUpdate(userId: string, unreadCount: number): void {
    const userSockets = this.getUserSockets(userId);
    userSockets.forEach(socketId => {
      this.io.to(socketId).emit('unread-count-update', {
        userId,
        unreadCount,
        timestamp: new Date().toISOString()
      });
    });
  }

  public emitUserOnlineStatus(userId: string, isOnline: boolean): void {
    this.io.emit('user-online-status', {
      userId,
      isOnline,
      timestamp: new Date().toISOString()
    });
  }

  public isUserOnline(userId: string): boolean {
    return this.userConnections.has(userId);
  }

  public getOnlineUsers(): string[] {
    return Array.from(this.userConnections.keys());
  }

  public getIO(): SocketIOServer {
    return this.io;
  }
}
declare module 'socket.io' {
  interface Socket {
    userId?: string;
    userRole?: 'User' | 'Shop';
  }
}

let socketHandler: SocketHandler;

export const initializeSocket = (server: HTTPServer): SocketHandler => {
  if (!socketHandler) {
    socketHandler = new SocketHandler(server);
  }
  return socketHandler;
};

export const getSocketHandler = (): SocketHandler => {
  if (!socketHandler) {
    throw new Error('Socket handler not initialized. Call initializeSocket first.');
  }
  return socketHandler;
};