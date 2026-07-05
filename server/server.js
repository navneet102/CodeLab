const http = require('http');
const app = require('./src/app');
const connectDB = require('./src/config/db');
const { getRedisClient } = require('./src/config/redis');
const { setupSocket } = require('./src/socket');
const { startYjsServer } = require('./src/yjs/yjsServer');
const { PORT } = require('./src/config/env');

const startServer = async () => {
  // Connect to MongoDB
  await connectDB();

  // Initialize Redis connection
  getRedisClient();

  // Create HTTP server
  const server = http.createServer(app);

  // Setup Socket.IO
  setupSocket(server);

  // Start Yjs WebSocket server (separate port)
  startYjsServer();

  // Start the main server
  server.listen(PORT, () => {
    console.log(`\n🚀 CodeSync Server running on port ${PORT}`);
    console.log(`   API: http://localhost:${PORT}/api`);
    console.log(`   Health: http://localhost:${PORT}/api/health\n`);
  });
};

startServer().catch((err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
