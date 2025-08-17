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

export class SocketHandler {
  private io: SocketIOServer;

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        // FIXED: Use consistent environment variable name
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    this.setupEventHandlers();
    console.log('✅ Socket.IO server initialized');
  }

  private setupEventHandlers(): void {
   this.io.on('connection', (socket: Socket) => {
      console.log(`🔌 Client connected: ${socket.id}`);

      // Join shop-specific room for real-time updates
      socket.on('join-shop', (shopId: string) => {
        if (shopId) {
          socket.join(`shop-${shopId}`);
          console.log(`🏪 Client ${socket.id} joined shop room: ${shopId}`);
        }
      });

      // Leave shop room
      socket.on('leave-shop', (shopId: string) => {
        if (shopId) {
          socket.leave(`shop-${shopId}`);
          console.log(`👋 Client ${socket.id} left shop room: ${shopId}`);
        }
      });

      socket.on('disconnect', () => {
        console.log(`❌ Client disconnected: ${socket.id}`);
      });
    });
  }

  /**
   * Emit slot booked event to all clients in the shop room
   * This will trigger real-time removal of the booked slot from UI
   */
  public emitSlotBooked(data: SlotBookedData): void {
    console.log('📅 Emitting slot booked event:', data);
    
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

  /**
   * Emit slot canceled event to all clients in the shop room
   * This will trigger real-time addition of the canceled slot back to UI
   */
  public emitSlotCanceled(data: SlotCanceledData): void {
    console.log('❌ Emitting slot canceled event:', data);
    
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

  /**
   * Get the Socket.IO instance
   */
  public getIO(): SocketIOServer {
    return this.io;
  }
}

// Export singleton instance
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