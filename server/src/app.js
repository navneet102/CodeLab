const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { CLIENT_URL } = require('./config/env');
const errorHandler = require('./middleware/errorHandler');
const roomRoutes = require('./routes/room.routes');
const executionRoutes = require('./routes/execution.routes');

const app = express();

// Security middleware
app.use(helmet());

// CORS
app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/rooms', roomRoutes);
app.use('/api/execution', executionRoutes);

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;
