const { enqueueExecution } = require('../queues/executionQueue');
const Execution = require('../models/Execution');

module.exports = (io, socket) => {
  // Run code (no test cases)
  socket.on('code:run', async ({ language, code, stdin }) => {
    if (!socket.roomId || !socket.username) {
      socket.emit('code:error', { message: 'Not in a room' });
      return;
    }

    try {
      // Create execution record
      const execution = await Execution.create({
        roomId: socket.roomId,
        username: socket.username,
        language,
        code,
        stdin: stdin || '',
        status: 'queued',
      });

      // Notify room that code is queued
      io.to(socket.roomId).emit('code:status', {
        executionId: execution._id.toString(),
        status: 'queued',
        username: socket.username,
      });

      // Enqueue job for the worker
      await enqueueExecution({
        executionId: execution._id.toString(),
        roomId: socket.roomId,
        username: socket.username,
        language,
        code,
        stdin: stdin || '',
      });
    } catch (error) {
      console.error('Error enqueuing code:', error);
      socket.emit('code:error', { message: 'Failed to queue code execution' });
    }
  });

  // Run code against test cases (interview mode)
  socket.on('code:run-tests', async ({ language, code, testCases }) => {
    if (!socket.roomId || !socket.username) {
      socket.emit('code:error', { message: 'Not in a room' });
      return;
    }

    try {
      const execution = await Execution.create({
        roomId: socket.roomId,
        username: socket.username,
        language,
        code,
        status: 'queued',
      });

      io.to(socket.roomId).emit('code:status', {
        executionId: execution._id.toString(),
        status: 'queued',
        username: socket.username,
        isTestRun: true,
      });

      await enqueueExecution({
        executionId: execution._id.toString(),
        roomId: socket.roomId,
        username: socket.username,
        language,
        code,
        testCases,
      });
    } catch (error) {
      console.error('Error enqueuing test run:', error);
      socket.emit('code:error', { message: 'Failed to queue test execution' });
    }
  });
};
