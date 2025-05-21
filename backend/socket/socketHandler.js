// =============================================================================
// backend/socket/socketHandler.js
// Handles all Socket.IO connection logic and event listeners
// =============================================================================
import { Server } from 'socket.io';
import { protectSocket } from '../middleware/authMiddleware.js';

// Keep track of connected users { socketId: { userId, username } }
const connectedUsers = new Map();

// Function to get list of online users
const getOnlineUsers = () =>
  Array.from(connectedUsers.values()).map(u => ({
    userId: u.userId,
    username: u.username
  }));

export const initSocketIO = (server, corsOptions) => {
  const io = new Server(server, {
    cors: corsOptions,
    transports: ['websocket', 'polling'],
    pingInterval: 25000,
    pingTimeout: 60000,
    connectTimeout: 45000,
    allowEIO3: true,
    maxHttpBufferSize: 1e8
  });

  // --- Middleware ---
  io.use(protectSocket);

  // --- Connection Event ---
  io.on('connection', (socket) => {
    const { id: userId, username } = socket.user;
    console.log(`User connected: ${username} (Socket ID: ${socket.id})`);

    // Store user info
    connectedUsers.set(socket.id, { userId, username });

    // Notify everyone of updated user list
    io.emit('update_user_list', getOnlineUsers());

    // Welcome and broadcast join
    socket.emit('server_message', { text: `Welcome to the chat, ${username}!` });
    socket.broadcast.emit('server_message', { text: `${username} has joined the chat.` });

    // --- Room management ---
    socket.on('join_room', (roomId) => {
      socket.join(roomId);
      socket.emit('joined_room', roomId);
    });

    socket.on('leave_room', (roomId) => {
      socket.leave(roomId);
      socket.emit('left_room', roomId);
    });

    socket.on('room_message', (data) => {
      // data: { roomId, text, hasFormatting }
      const msg = {
        id: `${data.roomId}-${Date.now()}`,
        username,
        text: data.text,
        timestamp: new Date().toISOString(),
        roomId: data.roomId,
        hasFormatting: data.hasFormatting || false,
        type: 'room'
      };
      io.to(data.roomId).emit('new_room_message', msg);
    });

    // --- Private messaging ---
    socket.on('private_message', (data) => {
      // data: { toUserId, text, hasFormatting }
      const msg = {
        id: `${userId}-${data.toUserId}-${Date.now()}`,
        from: username,
        toUserId: data.toUserId,
        text: data.text,
        timestamp: new Date().toISOString(),
        hasFormatting: data.hasFormatting || false,
        type: 'private'
      };
      // send to receiver
      for (const [sockId, u] of connectedUsers) {
        if (u.userId === data.toUserId) {
          io.to(sockId).emit('new_private_message', msg);
        }
      }
      // echo back to sender
      socket.emit('new_private_message', msg);
    });

    // --- Global chat messages ---
    socket.on('chat_message', (msgData) => {
      if (!msgData || typeof msgData.text !== 'string' || !msgData.text.trim()) {
        socket.emit('error_message', { text: 'Invalid message format.' });
        return;
      }
      const message = {
        id: `${socket.id}-${Date.now()}`,
        username,
        text: msgData.text.trim(),
        timestamp: new Date().toISOString(),
        type: 'global'
      };
      io.emit('new_message', message);
    });

    // --- Typing indicators ---
    socket.on('typing_start', () => {
      socket.broadcast.emit('user_typing', { username });
    });
    socket.on('typing_stop', () => {
      socket.broadcast.emit('user_stopped_typing', { username });
    });

    // --- Handle request for user list ---
    socket.on('request_user_list', () => {
      socket.emit('update_user_list', getOnlineUsers());
    });

    // --- Disconnection ---
    socket.on('disconnect', (reason) => {
      console.log(`User disconnected: ${username} (Socket ID: ${socket.id}). Reason: ${reason}`);
      connectedUsers.delete(socket.id);

      // Notify everyone
      io.emit('server_message', { text: `${username} has left the chat.` });
      io.emit('update_user_list', getOnlineUsers());
      io.emit('user_stopped_typing', { username });
    });

    // --- Error handling ---
    socket.on('error', (err) => {
      console.error(`Socket Error on ${socket.id}: ${err.message}`);
      socket.emit('error_message', { text: `An error occurred: ${err.message}` });
    });
  });

  console.log('Socket.IO initialized');
  return io;
};
