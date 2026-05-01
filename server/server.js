require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/db');
const jwt = require('jsonwebtoken');
const { User } = require('./models');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  },
});

// Auth middleware for sockets
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('No token'));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('name avatar');
    if (!user) return next(new Error('User not found'));

    socket.user = user;
    next();
  } catch {
    next(new Error('Invalid token'));
  }
});

// Track online users
const onlineUsers = new Map(); // userId -> socketId

io.on('connection', (socket) => {
  const userId = socket.user._id.toString();
  onlineUsers.set(userId, socket.id);

    // ← ADD THIS: join personal room for targeted notifications
  socket.join(`user_${userId}`);

  console.log(`🟢 ${socket.user.name} connected`);

  // Join a conversation room
  socket.on('join_conversation', (conversationId) => {
    socket.join(conversationId);
    console.log(`💬 ${socket.user.name} joined room: ${conversationId}`);
  });

  // Leave conversation room
  socket.on('leave_conversation', (conversationId) => {
    socket.leave(conversationId);
  });

  // Send message via socket
  socket.on('send_message', (data) => {
    // Broadcast to everyone in the room except sender
    socket.to(data.conversationId).emit('receive_message', {
      ...data,
      sender: { _id: userId, name: socket.user.name, avatar: socket.user.avatar },
    });
  });

  // Typing indicator
  socket.on('typing', (conversationId) => {
    socket.to(conversationId).emit('user_typing', {
      userId,
      name: socket.user.name,
    });
  });

  socket.on('stop_typing', (conversationId) => {
    socket.to(conversationId).emit('user_stop_typing', { userId });
  });

  socket.on('disconnect', () => {
    onlineUsers.delete(userId);
    console.log(`🔴 ${socket.user.name} disconnected`);
  });
});

// Make io accessible in controllers if needed
app.set('io', io);

const startServer = async () => {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV}`);
  });
};

startServer();