const IORedis = require('ioredis');
const { REDIS_URL } = require('./env');

// Connection for general use (pub/sub, BullMQ)
const createRedisConnection = () => {
  return new IORedis(REDIS_URL, {
    maxRetriesPerRequest: null, // Required by BullMQ
    enableReadyCheck: false,
  });
};

module.exports = createRedisConnection;