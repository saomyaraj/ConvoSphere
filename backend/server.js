// =============================================================================
// backend/server.js
// Main server file: Sets up Express, MongoDB, Socket.IO, routes, and middleware
// =============================================================================
import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import { initSocketIO } from './socket/socketHandler.js';

// --- Initial Setup ---
dotenv.config(); // Load .env variables
connectDB(); // Connect to MongoDB

const app = express();
const server = http.createServer(app); // Create HTTP server for Socket.IO

// --- Middleware ---
const corsOptions = {
    origin: [process.env.CORS_ORIGIN, "http://localhost:5173"],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true, // Allow cookies/headers for auth if needed later
    allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions)); // Enable CORS
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// --- API Routes ---
app.get('/', (req, res) => { // Simple root route check
    res.send('Chat App Backend API is running...');
});
app.use('/api/auth', authRoutes); // Mount authentication routes

// --- Initialize Socket.IO ---
const io = initSocketIO(server, corsOptions); // Pass server and CORS options

// --- Error Handling Middleware (Basic) ---
// Not Found handler
app.use((req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
});

// General error handler
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        // Provide stack trace only in development
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

// --- Start Server ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`Allowing CORS origin: ${corsOptions.origin}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.error(`Unhandled Rejection: ${err.message}`);
    // Close server & exit process (optional, but recommended for stability)
    // server.close(() => process.exit(1));
});