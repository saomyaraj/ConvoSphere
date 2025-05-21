import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import io from 'socket.io-client';
import { AuthContext } from './AuthContext';

export const SocketContext = createContext(null);

// Use http:// for Socket.IO connection
const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const { token, isAuthenticated } = useContext(AuthContext);
  const socketRef = useRef(null);
  
  useEffect(() => {
    // Only attempt connection if authenticated and we have a token
    if (!isAuthenticated || !token) {
      console.log("Socket connection skipped: Not authenticated");
      return;
    }
    
    // Don't reconnect if we've tried too many times
    if (connectionAttempts >= 5) {
      console.log("Maximum connection attempts reached. Please refresh the page.");
      return;
    }
    
    console.log(`Connection attempt #${connectionAttempts + 1}: Connecting to ${WS_URL}`);
    
    // Create a new socket connection
    const newSocket = io(WS_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000
    });
    
    // Store in ref for cleanup
    socketRef.current = newSocket;
    
    // Connection handlers
    const onConnect = () => {
      console.log('Socket connected:', newSocket.id);
      setIsConnected(true);
      setSocket(newSocket);
      setConnectionAttempts(0);
    };
    
    const onDisconnect = (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
      
      // Only increment attempts for certain disconnect reasons
      if (reason === 'io server disconnect' || reason === 'transport close') {
        setConnectionAttempts(prev => prev + 1);
      }
    };
    
    const onConnectError = (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
      setConnectionAttempts(prev => prev + 1);
    };
    
    // Register event handlers
    newSocket.on('connect', onConnect);
    newSocket.on('disconnect', onDisconnect);
    newSocket.on('connect_error', onConnectError);
    
    // Cleanup function
    return () => {
      console.log('Cleaning up socket connection');
      if (socketRef.current) {
        socketRef.current.off('connect', onConnect);
        socketRef.current.off('disconnect', onDisconnect);
        socketRef.current.off('connect_error', onConnectError);
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [token, isAuthenticated, connectionAttempts]);
  
  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};