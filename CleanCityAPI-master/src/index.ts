import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';

import authRoutes from './routes/auth';
import occurrenceRoutes from './routes/occurrences';
import shareRoutes from './routes/shares';
import photoRoutes from './routes/photos';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { optionalAuthMiddleware } from './middleware/auth';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    credentials: true,
  },
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true,
}));

app.use(optionalAuthMiddleware);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/occurrences', occurrenceRoutes);
app.use('/api/shares', shareRoutes);
app.use('/api/photos', photoRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// WebSocket for real-time sync
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('user:login', (data) => {
    socket.join(`user:${data.userId}`);
    console.log(`User ${data.userId} connected to real-time updates`);
  });

  socket.on('occurrence:created', (data) => {
    io.emit('occurrence:new', data);
    console.log('New occurrence created:', data.id);
  });

  socket.on('occurrence:updated', (data) => {
    io.emit('occurrence:changed', data);
    console.log('Occurrence updated:', data.id);
  });

  socket.on('occurrence:deleted', (data) => {
    io.emit('occurrence:removed', data);
    console.log('Occurrence deleted:', data.id);
  });

  socket.on('photo:uploaded', (data) => {
    io.to(`user:${data.userId}`).emit('photo:new', data);
    console.log('New photo uploaded:', data.id);
  });

  socket.on('share:created', (data) => {
    io.to(`user:${data.sharedWithId}`).emit('share:received', data);
    console.log('New share:', data.id);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export { app, io };
