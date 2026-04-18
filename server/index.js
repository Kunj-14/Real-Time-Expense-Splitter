const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const path = require('path');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.set('io', io);

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/groups', require('./routes/groupRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));

app.get('/', (req, res) => {
  res.send('API is running...');
});
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join_group', (groupId) => {
    socket.join(groupId);
    console.log(`User ${socket.id} joined group ${groupId}`);
  });

  socket.on('leave_group', (groupId) => {
    socket.leave(groupId);
    console.log(`User ${socket.id} left group ${groupId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/expense-splitter';

let isConnected;

const connectDB = async () => {
  if (isConnected) return;
  try {
    const db = await mongoose.connect(MONGO_URI);
    isConnected = db.connections[0].readyState;
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
};

connectDB();

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
