// socket.io-client.ts - Fixed implementation
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
  private maxRetries = 5;
  private retryDelay = 1000;
  private isConnecting = false;
  private eventListeners: Map<string, Function[]> = new Map();

  getSocket(): Socket {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        withCredentials: true,
        autoConnect: false,
        transports: ['websocket', 'polling'],
        timeout: 20000,
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

    // Connection events
    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket?.id);
      this.connectionAttempts = 0;
      this.isConnecting = false;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      this.isConnecting = false;
      
      if (reason === 'io server disconnect') {
        setTimeout(() => this.connectSocket(), 1000);
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔌 Socket connection error:', error);
      this.connectionAttempts++;
      this.isConnecting = false;
      
      if (this.connectionAttempts >= this.maxRetries) {
        console.error('❌ Max connection attempts reached. Stopping retries.');
      }
    });

    this.socket.on('reconnect', (attempt) => {
      console.log(`🔄 Socket reconnected after ${attempt} attempts`);
      this.connectionAttempts = 0;
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('🔄❌ Socket reconnection error:', error);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('🔄❌ Socket failed to reconnect after all attempts');
    });

    // Chat-specific event listeners with proper error handling
    this.socket.on('new-message', (data: SocketEventData) => {
      try {
        console.log('📩 New message received:', data);
        this.notifyListeners('new-message', data);
      } catch (error) {
        console.error('Error handling new message:', error);
      }
    });

    this.socket.on('message-delivered', (data: SocketEventData) => {
      try {
        console.log('📨 Message delivered:', data);
        this.notifyListeners('message-delivered', data);
      } catch (error) {
        console.error('Error handling message delivered:', error);
      }
    });

    this.socket.on('message-read', (data: SocketEventData) => {
      try {
        console.log('👁️ Message marked as read:', data);
        this.notifyListeners('message-read', data);
      } catch (error) {
        console.error('Error handling message read:', error);
      }
    });

    this.socket.on('user-typing', (data: SocketEventData) => {
      try {
        console.log('⌨️ User typing:', data);
        this.notifyListeners('user-typing', data);
      } catch (error) {
        console.error('Error handling user typing:', error);
      }
    });

    this.socket.on('user-stopped-typing', (data: SocketEventData) => {
      try {
        console.log('⌨️ User stopped typing:', data);
        this.notifyListeners('user-stopped-typing', data);
      } catch (error) {
        console.error('Error handling user stopped typing:', error);
      }
    });

    this.socket.on('chat-updated', (data: SocketEventData) => {
      try {
        console.log('💬 Chat updated:', data);
        this.notifyListeners('chat-updated', data);
      } catch (error) {
        console.error('Error handling chat updated:', error);
      }
    });

    this.socket.on('reaction-added', (data: SocketEventData) => {
      try {
        console.log('😊 Reaction added:', data);
        this.notifyListeners('reaction-added', data);
      } catch (error) {
        console.error('Error handling reaction added:', error);
      }
    });

    this.socket.on('reaction-removed', (data: SocketEventData) => {
      try {
        console.log('😐 Reaction removed:', data);
        this.notifyListeners('reaction-removed', data);
      } catch (error) {
        console.error('Error handling reaction removed:', error);
      }
    });

    this.socket.on('message-deleted', (data: SocketEventData) => {
      try {
        console.log('🗑️ Message deleted:', data);
        this.notifyListeners('message-deleted', data);
      } catch (error) {
        console.error('Error handling message deleted:', error);
      }
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      this.notifyListeners('error', error);
    });

    // Join room confirmation
    this.socket.on('joined-chat', (data: SocketEventData) => {
      console.log('🏠 Joined chat room:', data);
      this.notifyListeners('joined-chat', data);
    });

    this.socket.on('left-chat', (data: SocketEventData) => {
      console.log('🚪 Left chat room:', data);
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

  connectSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnecting) {
        console.log('🔌 Connection already in progress...');
        return resolve();
      }

      const socket = this.getSocket();
      
      if (socket.connected) {
        console.log('✅ Socket already connected');
        return resolve();
      }

      this.isConnecting = true;

      const onConnect = () => {
        socket.off('connect', onConnect);
        socket.off('connect_error', onError);
        this.isConnecting = false;
        resolve();
      };

      const onError = (error: Error) => {
        socket.off('connect', onConnect);
        socket.off('connect_error', onError);
        this.isConnecting = false;
        reject(error);
      };

      socket.on('connect', onConnect);
      socket.on('connect_error', onError);

      console.log('🔌 Attempting to connect socket...');
      socket.connect();

      // Timeout after 15 seconds
      setTimeout(() => {
        if (this.isConnecting) {
          socket.off('connect', onConnect);
          socket.off('connect_error', onError);
          this.isConnecting = false;
          reject(new Error('Socket connection timeout'));
        }
      }, 15000);
    });
  }

  disconnectSocket(): void {
    if (this.socket) {
      console.log('🔌❌ Disconnecting socket...');
      this.socket.disconnect();
      this.isConnecting = false;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Chat-specific methods with validation
  joinChat(chatId: string, userId: string, userRole: 'User' | 'Shop'): void {
    if (!this.socket?.connected) {
      console.warn('Cannot join chat: Socket not connected');
      return;
    }

    if (!chatId || !userId || !userRole) {
      console.warn('Cannot join chat: Missing required parameters');
      return;
    }

    console.log(`🏠 Joining chat: ${chatId} as ${userRole} (${userId})`);
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

    console.log(`🚪 Leaving chat: ${chatId}`);
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

  // Event listener management
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

  // Generic event emitter with validation
  emit(event: string, data: any): void {
    if (!this.socket?.connected) {
      console.warn(`Cannot emit ${event}: Socket not connected`);
      return;
    }
    
    this.socket.emit(event, data);
  }

  // Generic event listener
  on(event: string, callback: (...args: any[]) => void): void {
    this.socket?.on(event, callback);
  }

  off(event: string, callback?: (...args: any[]) => void): void {
    this.socket?.off(event, callback);
  }

  // Cleanup method
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

  // Get connection status
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

// Create singleton instance
const socketManager = new SocketManager();

// Export convenience methods
export const getSocket = (): Socket => socketManager.getSocket();
export const connectSocket = (): Promise<void> => socketManager.connectSocket();
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

// Export the manager for advanced use cases
export default socketManager;