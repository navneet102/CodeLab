const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  inviteCode: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  language: {
    type: String,
    enum: ['cpp', 'java', 'python'],
    default: 'python',
  },
  mode: {
    type: String,
    enum: ['collaborate', 'interview', 'teaching'],
    default: 'collaborate',
  },
  starterCode: {
    type: String,
    default: '',
  },
  testCases: [{
    input: { type: String, default: '' },
    expectedOutput: { type: String, default: '' },
    isHidden: { type: Boolean, default: false },
  }],
  activeUsers: [{
    username: String,
    socketId: String,
    color: String,
    joinedAt: { type: Date, default: Date.now },
  }],
  chat: [{
    username: String,
    message: String,
    timestamp: { type: Date, default: Date.now },
  }],
  owner: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Generate a random 6-character invite code
roomSchema.statics.generateInviteCode = function () {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No ambiguous chars (0/O, 1/I/L)
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

module.exports = mongoose.model('Room', roomSchema);
