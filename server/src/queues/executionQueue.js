const { Queue } = require('bullmq');
const createRedisConnection = require('../config/redis');

const executionQueue = new Queue('code-execution', {
  connection: createRedisConnection(),
  defaultJobOptions: {
    removeOnComplete: { count: 100 }, // Keep last 100 completed jobs
    removeOnFail: { count: 50 },     // Keep last 50 failed jobs
    attempts: 1,                      // Don't retry code execution
  },
});

/**
 * Enqueue a code execution job
 * @param {Object} data - { roomId, username, language, code, stdin, testCases }
 * @returns {Promise<import('bullmq').Job>}
 */
const enqueueExecution = async (data) => {
  const job = await executionQueue.add('execute', data, {
    priority: 1,
  });
  console.log(`📦 Enqueued execution job ${job.id} for room ${data.roomId}`);
  return job;
};

module.exports = { executionQueue, enqueueExecution };
