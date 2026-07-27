import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import categoryRoutes from './routes/category.routes';
import orderRoutes from './routes/order.routes';
import adminRoutes from './routes/admin.routes';
import settingsRoutes from './routes/settings.routes';
import popupRoutes from './routes/popup.routes';

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  },
});

app.set('io', io);

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/popups', popupRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Shulov Grocery API is running seamlessly' });
});

// Real-time socket connections
io.on('connection', (socket) => {
  console.log(`🔌 Client connected to Socket.io: ${socket.id}`);

  socket.on('join-order', (orderId) => {
    socket.join(`order-${orderId}`);
    console.log(`Socket ${socket.id} joined room order-${orderId}`);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Shulov Backend Server running on http://localhost:${PORT}`);
});
