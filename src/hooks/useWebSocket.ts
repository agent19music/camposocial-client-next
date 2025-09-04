import { useEffect, useRef, useCallback, useState } from 'react';
import io, { type Socket } from 'socket.io-client';
import { useContext } from 'react';
import { AuthContext } from '@/context/authcontext';
import { toast } from 'react-hot-toast';

interface WebSocketHook {
  socket: typeof Socket | null;
  isConnected: boolean;
  emit: (event: string, data: any) => void;
  on: (event: string, handler: (data: any) => void) => void;
  off: (event: string, handler?: (data: any) => void) => void;
}

export function useWebSocket(): WebSocketHook {
  const socketRef = useRef<typeof Socket | null>(null);
  const { authToken } = useContext(AuthContext);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    if (!authToken) return;

    const wsEndpoint = process.env.NEXT_PUBLIC_WS_ENDPOINT || 
                      process.env.NEXT_PUBLIC_API_ENDPOINT?.replace('/camposocial/api', '') || 
                      'http://localhost:5000';

    const socket = io(wsEndpoint, {
      transports: ['websocket', 'polling'],
      auth: { token: authToken },
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      reconnectAttemptsRef.current = 0;
      
      // Authenticate immediately after connection
      socket.emit('authenticate', { token: authToken });
    });

    socket.on('disconnect', (reason: any) => {
      console.log('WebSocket disconnected:', reason);
      setIsConnected(false);
      
      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        socket.connect();
      }
    });

    socket.on('connect_error', (error: any) => {
      console.error('Connection error:', error);
      reconnectAttemptsRef.current++;
      
      if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
        toast.error('Failed to connect to chat server');
      }
    });

    socket.on('authenticated', (data: any) => {
      console.log('Socket authenticated:', data);
      toast.success('Connected to chat');
    });

    socket.on('error', (error: any) => {
      console.error('Socket error:', error);
      toast.error(error.message || 'Connection error');
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [authToken]);

  const emit = useCallback((event: string, data: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot emit:', event);
    }
  }, []);

  const on = useCallback((event: string, handler: (data: any) => void) => {
    socketRef.current?.on(event, handler);
  }, []);

  const off = useCallback((event: string, handler?: (data: any) => void) => {
    if (handler) {
      socketRef.current?.off(event, handler);
    } else {
      socketRef.current?.off(event);
    }
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    emit,
    on,
    off,
  };
}
