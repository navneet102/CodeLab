const { Server } = require('socket.io');
const { CLIENT_URL } = require('../config/env');
const createRedisConnection = require('../config/redis');
const Execution = require('../models/Execution');
const roomHandlers = require('./roomHandlers');
const executionHandlers = require('./executionHandlers');

let io;

const setupSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: CLIENT_URL,
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Register event handlers
    roomHandlers(io, socket);
    executionHandlers(io, socket);

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  // Subscribe to execution results from the worker via Redis pub/sub
  const subscriber = createRedisConnection();
  subscriber.subscribe('execution:result', (err) => {
    if (err) console.error('❌ Redis subscribe error:', err);
    else console.log('✅ Subscribed to execution:result channel');
  });

  subscriber.on('message', async (channel, message) => {
    if (channel === 'execution:result') {
      try {
        const result = JSON.parse(message);
        const { executionId, roomId, status, stdout, stderr, exitCode, executionTimeMs, testResults } = result;

        // Update execution record in DB
        await Execution.findByIdAndUpdate(executionId, {
          status,
          stdout,
          stderr,
          exitCode,
          executionTimeMs,
          testResults: testResults || [],
        });

        // Broadcast result to the room
        io.to(roomId).emit('code:result', {
          executionId,
          status,
          stdout,
          stderr,
          exitCode,
          executionTimeMs,
          testResults,
          username: result.username,
        });

        console.log(`📤 Sent execution result to room ${roomId}`);
      } catch (error) {
        console.error('Error processing execution result:', error);
      }
    }
  });

  console.log('✅ Socket.IO initialized');
  return io;
};

module.exports = { setupSocket };
