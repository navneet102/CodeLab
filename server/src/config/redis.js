const IORedis = require('ioredis');
const { REDIS_URL } = require('./env');

// Connection for general use (pub/sub, caching)
const createRedisConnection = () => {
  return new IORedis(REDIS_URL, {
    maxRetriesPerRequest: null, // Required by BullMQ
    enableReadyCheck: false,
  });
};

// Singleton connection for general use
let redisClient = null;

const getRedisClient = () => {
  if (!redisClient) {
    redisClient = createRedisConnection();
    redisClient.on('connect', () => {
      console.log('✅ Redis connected');
    });
    redisClient.on('error', (err) => {
      console.error('❌ Redis error:', err.message);
    });
  }
  return redisClient;
};

module.exports = { createRedisConnection, getRedisClient };
