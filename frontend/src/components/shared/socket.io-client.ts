// socket.io-client.ts
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

interface SocketMessage {
  _id: string;
  chatId: string;
  senderRole: 'User' | 'Shop';
  messageType: 'Text' | 'Image' | 'Video' | 'Audio' | 'File';
  content: string;
  mediaUrl?: string;
  isRead: boolean;
  deliveredAt?: string;
  readAt?: string;
  reactions: any[];
  createdAt: string;
  updatedAt: string;
  senderId: string;
  receiverId: string;
}

interface SocketEventData {
  chatId: string;
  message?: SocketMessage;
  messageId?: string;
  userId?: string;
  userRole?: 'User' | 'Shop';
  typing?: boolean;
  data?: any;
}

class SocketManager {
  private socket: Socket | null = null;
  private connectionAttempts = 0;
  private maxRetries = 10; 
  private retryDelay = 2000;
  private isConnecting = false;
  private eventListeners: Map<string, Function[]> = new Map();

  getSocket(): Socket {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        withCredentials: true,
        autoConnect: false,
        transports: ['websocket'], 
        timeout: 30000, 
        reconnection: true,
        reconnectionAttempts: this.maxRetries,
        reconnectionDelay: this.retryDelay,
        reconnectionDelayMax: 5000,
        forceNew: false,
      });

      this.setupEventListeners();
    }
    return this.socket;
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this.connectionAttempts = 0;
      this.isConnecting = false;
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnecting = false;
      if (reason === 'io server disconnect') {
        setTimeout(() => this.connectSocket(), this.retryDelay);
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔌 Socket connection error:', error.message, error);
      this.connectionAttempts++;
      this.isConnecting = false;
      if (this.connectionAttempts >= this.maxRetries) {
        console.error('❌ Max connection attempts reached. Stopping retries.');
      }
    });

    this.socket.on('reconnect', (attempt) => {
      this.connectionAttempts = 0;
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('🔄❌ Socket reconnection error:', error.message);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('🔄❌ Socket failed to reconnect after all attempts');
    });

    this.socket.on('new-message', (data: SocketEventData) => {
      try {
        this.notifyListeners('new-message', data);
      } catch (error) {
        console.error('Error handling new message:', error);
      }
    });

    this.socket.on('message-notification', (data: SocketEventData) => {
      try {
        this.notifyListeners('message-notification', data);
      } catch (error) {
        console.error('Error handling message notification:', error);
      }
    });

    this.socket.on('unread-count-update', (data: any) => {
      try {
        this.notifyListeners('unread-count-update', data);
      } catch (error) {
        console.error('Error handling unread count update:', error);
      }
    });

    this.socket.on('chat-updated', (data: SocketEventData) => {
      try {
        this.notifyListeners('chat-updated', data);
      } catch (error) {
        console.error('Error handling chat updated:', error);
      }
    });

    this.socket.on('message-delivered', (data: SocketEventData) => {
      try {
        this.notifyListeners('message-delivered', data);
      } catch (error) {
        console.error('Error handling message delivered:', error);
      }
    });

    this.socket.on('message-read', (data: SocketEventData) => {
      try {
        this.notifyListeners('message-read', data);
      } catch (error) {
        console.error('Error handling message read:', error);
      }
    });

    this.socket.on('user-typing', (data: SocketEventData) => {
      try {
        this.notifyListeners('user-typing', data);
      } catch (error) {
        console.error('Error handling user typing:', error);
      }
    });

    this.socket.on('user-stopped-typing', (data: SocketEventData) => {
      try {
        this.notifyListeners('user-stopped-typing', data);
      } catch (error) {
        console.error('Error handling user stopped typing:', error);
      }
    });

    this.socket.on('reaction-added', (data: SocketEventData) => {
      try {
        this.notifyListeners('reaction-added', data);
      } catch (error) {
        console.error('Error handling reaction added:', error);
      }
    });

    this.socket.on('reaction-removed', (data: SocketEventData) => {
      try {
        this.notifyListeners('reaction-removed', data);
      } catch (error) {
        console.error('Error handling reaction removed:', error);
      }
    });

    this.socket.on('message-deleted', (data: SocketEventData) => {
      try {
        this.notifyListeners('message-deleted', data);
      } catch (error) {
        console.error('Error handling message deleted:', error);
      }
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      this.notifyListeners('error', error);
    });

    this.socket.on('joined-chat', (data: SocketEventData) => {
      this.notifyListeners('joined-chat', data);
    });

    this.socket.on('left-chat', (data: SocketEventData) => {
      this.notifyListeners('left-chat', data);
    });
  }

  private notifyListeners(event: string, data: any): void {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }

  connectSocket(userId?: string, userRole?: 'User' | 'Shop'): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnecting) {
        return resolve();
      }

      const socket = this.getSocket();
      
      if (socket.connected) {
        if (userId && userRole) {
          socket.emit('authenticate-user', { userId, userRole });
        }
        return resolve();
      }

      this.isConnecting = true;

      const onConnect = () => {
        socket.off('connect', onConnect);
        socket.off('connect_error', onError);
        this.isConnecting = false;
        if (userId && userRole) {
          socket.emit('authenticate-user', { userId, userRole });
        }
        resolve();
      };

      const onError = (error: Error) => {
        socket.off('connect', onConnect);
        socket.off('connect_error', onError);
        this.isConnecting = false;
        console.error('🔌 Connection failed:', error.message);
        reject(error);
      };

      socket.on('connect', onConnect);
      socket.on('connect_error', onError);

      socket.connect();

      setTimeout(() => {
        if (this.isConnecting) {
          socket.off('connect', onConnect);
          socket.off('connect_error', onError);
          this.isConnecting = false;
          reject(new Error('Socket connection timeout'));
        }
      }, 30000); // Increased timeout
    });
  }

  disconnectSocket(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.isConnecting = false;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  joinChat(chatId: string, userId: string, userRole: 'User' | 'Shop'): void {
    if (!this.socket?.connected) {
      console.warn('Cannot join chat: Socket not connected');
      return;
    }

    if (!chatId || !userId || !userRole) {
      console.warn('Cannot join chat: Missing required parameters');
      return;
    }

    this.socket.emit('join-chat', { chatId, userId, userRole });
  }

  leaveChat(chatId: string, userId: string): void {
    if (!this.socket?.connected) {
      console.warn('Cannot leave chat: Socket not connected');
      return;
    }

    if (!chatId || !userId) {
      console.warn('Cannot leave chat: Missing required parameters');
      return;
    }

    this.socket.emit('leave-chat', { chatId, userId });
  }

  sendTyping(chatId: string, userId: string, userRole: 'User' | 'Shop'): void {
    if (!this.socket?.connected) return;
    
    if (!chatId || !userId || !userRole) return;

    this.socket.emit('typing', { chatId, userId, userRole });
  }

  stopTyping(chatId: string, userId: string, userRole: 'User' | 'Shop'): void {
    if (!this.socket?.connected) return;
    
    if (!chatId || !userId || !userRole) return;

    this.socket.emit('stop-typing', { chatId, userId, userRole });
  }

  addEventListener(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  removeEventListener(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit(event: string, data: any): void {
    if (!this.socket?.connected) {
      console.warn(`Cannot emit ${event}: Socket not connected`);
      return;
    }
    
    this.socket.emit(event, data);
  }

  on(event: string, callback: (...args: any[]) => void): void {
    this.socket?.on(event, callback);
  }

  off(event: string, callback?: (...args: any[]) => void): void {
    this.socket?.off(event, callback);
  }

  destroy(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.isConnecting = false;
      this.connectionAttempts = 0;
      this.eventListeners.clear();
    }
  }

  getConnectionStatus(): {
    connected: boolean;
    connecting: boolean;
    id: string | undefined;
    attempts: number;
  } {
    return {
      connected: this.socket?.connected || false,
      connecting: this.isConnecting,
      id: this.socket?.id,
      attempts: this.connectionAttempts,
    };
  }
}

const socketManager = new SocketManager();

export const getSocket = (): Socket => socketManager.getSocket();
export const connectSocket = (userId?: string, userRole?: 'User' | 'Shop'): Promise<void> => socketManager.connectSocket(userId, userRole);
export const disconnectSocket = (): void => socketManager.disconnectSocket();
export const isSocketConnected = (): boolean => socketManager.isConnected();
export const getConnectionStatus = () => socketManager.getConnectionStatus();

export const joinChat = (chatId: string, userId: string, userRole: 'User' | 'Shop'): void => 
  socketManager.joinChat(chatId, userId, userRole);

export const leaveChat = (chatId: string, userId: string): void => 
  socketManager.leaveChat(chatId, userId);

export const sendTyping = (chatId: string, userId: string, userRole: 'User' | 'Shop'): void =>
  socketManager.sendTyping(chatId, userId, userRole);

export const stopTyping = (chatId: string, userId: string, userRole: 'User' | 'Shop'): void =>
  socketManager.stopTyping(chatId, userId, userRole);

export const addEventListener = (event: string, callback: Function): void =>
  socketManager.addEventListener(event, callback);

export const removeEventListener = (event: string, callback: Function): void =>
  socketManager.removeEventListener(event, callback);

export default socketManager;