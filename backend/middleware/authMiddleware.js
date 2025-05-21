// =============================================================================
// backend/middleware/authMiddleware.js
// Middleware to verify JWT for Socket.IO connections
// =============================================================================
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const protectSocket = async (socket, next) => {
  let token;

  // Get token from handshake query or auth header
  if (socket.handshake.query && socket.handshake.query.token) {
    token = socket.handshake.query.token;
  } else if (socket.handshake.auth && socket.handshake.auth.token) {
     token = socket.handshake.auth.token;
  }

  if (!token) {
    console.error('Socket Auth Error: No token provided');
    return next(new Error('Authentication error: No token'));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to the socket object (excluding password)
    // We could fetch the user from DB, but the token already has id/username
    // If more user data is needed per socket, fetch it here:
    // socket.user = await User.findById(decoded.id).select('-password');
    // For now, just use the decoded info:
    socket.user = { id: decoded.id, username: decoded.username };

    if (!socket.user) {
         console.error('Socket Auth Error: User not found for token');
        return next(new Error('Authentication error: User not found'));
    }

    next(); // Proceed to connection
  } catch (error) {
    console.error('Socket Auth Error:', error.message);
    return next(new Error('Authentication error: Invalid token'));
  }
};

export { protectSocket };