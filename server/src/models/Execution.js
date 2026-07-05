const mongoose = require('mongoose');

const executionSchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true,
    index: true,
  },
  username: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    enum: ['cpp', 'java', 'python'],
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  stdin: {
    type: String,
    default: '',
  },
  stdout: {
    type: String,
    default: '',
  },
  stderr: {
    type: String,
    default: '',
  },
  exitCode: {
    type: Number,
    default: null,
  },
  executionTimeMs: {
    type: Number,
    default: null,
  },
  status: {
    type: String,
    enum: ['queued', 'running', 'completed', 'error', 'timeout'],
    default: 'queued',
  },
  testResults: [{
    input: String,
    expectedOutput: String,
    actualOutput: String,
    passed: Boolean,
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Execution', executionSchema);
