// hooks/useSocket.ts 
import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface SlotBookedEvent {
  shopId: string;
  staffId: string;
  date: string;
  startTime: string;
  endTime: string;
  appointmentId: string;
  timestamp: string;
}

interface SlotCanceledEvent {
  shopId: string;
  staffId: string;
  date: string;
  startTime: string;
  endTime: string;
  appointmentId: string;
  timestamp: string;
}

interface UseSocketProps {
  shopId: string;
  onSlotBooked?: (data: SlotBookedEvent) => void;
  onSlotCanceled?: (data: SlotCanceledEvent) => void;
  enabled?: boolean;
}

export const useSocket = ({ 
  shopId, 
  onSlotBooked, 
  onSlotCanceled, 
  enabled = true 
}: UseSocketProps) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!enabled || !shopId) return;

    // Initialize socket connection
    const socket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000', {
      transports: ['websocket'],
      autoConnect: true,
    });

    socketRef.current = socket;

    // Connection event handlers
    socket.on('connect', () => {
      console.log('Connected to server:', socket.id);
      // Join shop-specific room
      socket.emit('join-shop', shopId);
    });

    socket.on('disconnect', (reason) => {
      console.log('Disconnected from server:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    // Slot booking event handler
    socket.on('slot-booked', (data: SlotBookedEvent) => {
      console.log('Received slot booked event:', data);
      if (onSlotBooked) {
        onSlotBooked(data);
      }
    });

    // Slot cancellation event handler
    socket.on('slot-canceled', (data: SlotCanceledEvent) => {
      console.log('Received slot canceled event:', data);
      if (onSlotCanceled) {
        onSlotCanceled(data);
      }
    });

    // Cleanup function
    return () => {
      socket.emit('leave-shop', shopId);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [shopId, enabled, onSlotBooked, onSlotCanceled]);

  // Function to manually emit events (if needed)
  const emitEvent = (eventName: string, data: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(eventName, data);
    }
  };

  return {
    socket: socketRef.current,
    isConnected: socketRef.current?.connected ?? false,
    emitEvent
  };
};