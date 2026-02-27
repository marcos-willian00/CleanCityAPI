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


app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true,
}));

app.use(optionalAuthMiddleware);


app.use('/api/auth', authRoutes);
app.use('/api/occurrences', occurrenceRoutes);
app.use('/api/shares', shareRoutes);
app.use('/api/photos', photoRoutes);


app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});


app.use(notFoundHandler);
app.use(errorHandler);


io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('user:login', (data) => {
    socket.join(`user:${data.userId}`);
    console.log(`User ${data.userId} connected`);
  });

  socket.on('occurrence:created', (data) => {
    io.emit('occurrence:new', data);
  });

  socket.on('occurrence:updated', (data) => {
    io.emit('occurrence:changed', data);
  });

  socket.on('occurrence:deleted', (data) => {
    io.emit('occurrence:removed', data);
  });

  socket.on('photo:uploaded', (data) => {
    io.to(`user:${data.userId}`).emit('photo:new', data);
  });

  socket.on('share:created', (data) => {
    io.to(`user:${data.sharedWithId}`).emit('share:received', data);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});


const PORT = process.env.PORT || 3000;

async function startServer() {
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer();

export { app, io };