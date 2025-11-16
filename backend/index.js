/**
 * Hi-Spectra Backend Server
 *
 * Express.js server providing NLU and speech processing APIs
 * for the Hi-Spectra voice assistant application.
 *
 * Endpoints:
 * - /api/intents/* - Intent classification and NLU
 * - /api/speech/* - Speech recognition and synthesis (future)
 * - /health - Health check
 *
 * @author Hi-Spectra Team
 * @version 1.0.0
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Import routes
const intentsRouter = require('./routes/intents');

// Initialize Express app
const app = express();

// Configuration
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Middleware Setup
 */

// Security headers with Helmet
app.use(helmet());

// CORS configuration - allow requests from desktop app
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:*', 'tauri://localhost'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Request logging in development
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' })); // For text input
app.use(express.urlencoded({ extended: true }));

/**
 * Routes
 */

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'hi-spectra-backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/api/intents', intentsRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Hi-Spectra Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      intents: '/api/intents',
      classify: '/api/intents/classify',
      batch: '/api/intents/batch'
    },
    documentation: '/docs' // Future: API documentation
  });
});

/**
 * Error Handling Middleware
 */

// 404 handler - must be after all other routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);

  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
    ...(NODE_ENV === 'development' && { stack: err.stack })
  });
});

/**
 * Server Startup
 */

// Only start server if this file is run directly (not imported for testing)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log('═══════════════════════════════════════════');
    console.log('  Hi-Spectra Backend Server');
    console.log('═══════════════════════════════════════════');
    console.log(`  Environment: ${NODE_ENV}`);
    console.log(`  Port: ${PORT}`);
    console.log(`  URL: http://localhost:${PORT}`);
    console.log(`  Health: http://localhost:${PORT}/health`);
    console.log('═══════════════════════════════════════════');
  });
}

// Export app for testing
module.exports = app;
