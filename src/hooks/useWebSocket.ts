import { useEffect, useRef, useCallback, useState, useContext } from 'react';
import io from 'socket.io-client';
import type { Socket as SocketIOClientSocket } from 'socket.io-client';
import { AuthContext } from '@/context/authcontext';

export interface WebSocketHook {
  socket: ReturnType<typeof io> | null;
  isConnected: boolean;
  emit: (event: string, data: any) => void;
  on: (event: string, handler: (data: any) => void) => () => void;
  off: (event: string, handler?: (data: any) => void) => void;
  joinConversationRoom: (conversationId: string) => void;
  leaveConversationRoom: (conversationId: string) => void;
  currentRooms: () => string[];
}

export function useWebSocket(): WebSocketHook {
  const socketRef = useRef<ReturnType<typeof io> | null>(null);
  const { authToken } = useContext(AuthContext);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const joinedRoomsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!authToken) {
      setIsConnected(false);
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      joinedRoomsRef.current.clear();
      return;
    }

    const wsEndpoint = process.env.NEXT_PUBLIC_WS_ENDPOINT || 
      process.env.NEXT_PUBLIC_API_ENDPOINT?.replace('/camposocial/api', '') || 
      'http://localhost:5000';

    // Disconnect previous socket if exists
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    const socket = io(wsEndpoint, {
      transports: ['websocket', 'polling'],
      auth: { token: authToken },
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ WebSocket connected, ID:', socket.id);
      setIsConnected(true);
      reconnectAttemptsRef.current = 0;
    });

    socket.on('connected', () => {
      joinedRoomsRef.current.clear();
    });

    socket.on('conversation_joined', (payload: { conversation_id: string }) => {
      if (payload?.conversation_id) {
        joinedRoomsRef.current.add(String(payload.conversation_id));
      }
    });

    socket.on('conversation_left', (payload: { conversation_id: string }) => {
      if (payload?.conversation_id) {
        joinedRoomsRef.current.delete(String(payload.conversation_id));
      }
    });

    socket.on('disconnect', (reason: any) => {
      setIsConnected(false);
      joinedRoomsRef.current.clear();
      if (reason === 'io server disconnect') {
        socket.connect();
      }
    });

    socket.on('connect_error', (error: any) => {
      reconnectAttemptsRef.current++;
      if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
        setIsConnected(false);
      }
    });

    socket.on('error', (error: any) => {
      console.error('❌ Socket error:', error);
    });

    return () => {
      console.log('🧹 Cleaning up socket connection');
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      joinedRoomsRef.current.clear();
    };
  }, [authToken]);

  // Improved emit with connection check
  const emit = useCallback((event: string, data: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
      console.log(`📤 Emitted ${event}:`, data);
    } else {
      console.warn(`⚠️ Cannot emit ${event}: Socket not connected`);
    }
  }, []);
    // Improved on with cleanup function return
  const currentRooms = useCallback((): string[] => Array.from(joinedRoomsRef.current), []);
  const on = useCallback((event: string, handler: (data: any) => void): (() => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, handler);
      console.log(`👂 Listening for ${event}`);
      // Return cleanup function
      return () => {
        socketRef.current?.off(event, handler);
        console.log(`🔇 Stopped listening for ${event}`);
      };
    }
    return () => {};
  }, []);

  const off = useCallback((event: string, handler?: (data: any) => void) => {
    if (socketRef.current) {
      if (handler) {
        socketRef.current.off(event, handler);
      } else {
        socketRef.current.off(event);
      }
    }
  }, []);

  // Manually join a conversation room (for when user opens a specific chat)
  const joinConversationRoom = useCallback((conversationId: string) => {
    if (!conversationId) return;
    const normalized = String(conversationId);
    if (socketRef.current?.connected && !joinedRoomsRef.current.has(normalized)) {
      socketRef.current.emit('join_conversation', { conversation_id: normalized });
      // Do not add to joinedRoomsRef here, wait for server confirmation
      console.log(`🚪 Requested to join conversation room: ${normalized}`);
    }
  }, []);

  // Leave a conversation room (for when user closes a chat)
  const leaveConversationRoom = useCallback((conversationId: string) => {
    if (!conversationId) return;
    const normalized = String(conversationId);
    if (socketRef.current?.connected && joinedRoomsRef.current.has(normalized)) {
      socketRef.current.emit('leave_conversation', { conversation_id: normalized });
      // Do not delete from joinedRoomsRef here, wait for server confirmation
      console.log(`🚪 Requested to leave conversation room: ${normalized}`);
    }
  }, []);

  // Remove duplicate declaration if present

  return {
    socket: socketRef.current,
    isConnected,
    emit,
    on,
    off,
    joinConversationRoom,
    leaveConversationRoom,
    currentRooms,
  };
}
