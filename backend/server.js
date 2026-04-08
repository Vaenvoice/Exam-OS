const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
const { syncDB } = require('./models');
const seedData = require('./db/seed');

// Load env vars
dotenv.config();

// Connect and sync DB
syncDB().then(() => {
  seedData();
});

const app = express();

console.log(`[STARTUP] Initializing Exam-OS Backend...`);
console.log(`[STARTUP] Environment: ${process.env.NODE_ENV || 'development'}`);

// Health check endpoints - MOVE TO TOP to ensure they respond immediately
app.get('/', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Exam-OS API is running (Basic Check)', timestamp: new Date().toISOString() });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Service Healthy', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Body parser
app.use(express.json());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Security headers
app.use(helmet());

// Enable CORS
app.use(cors());

// Compression
app.use(compression());

// Route files
const auth = require('./routes/auth');
const exams = require('./routes/exam');
const users = require('./routes/user');
const bulk = require('./routes/bulk');

// Mount routers
app.use('/api/auth', auth);
app.use('/api/exams', exams);
app.use('/api/users', users);
app.use('/api/bulk', bulk);


// Self-ping to keep service alive (if RENDER_EXTERNAL_URL is set)
let SELF_URL = process.env.RENDER_EXTERNAL_URL;
if (SELF_URL) {
  // Remove trailing slash if present
  if (SELF_URL.endsWith('/')) {
    SELF_URL = SELF_URL.slice(0, -1);
  }
  
  const https = require('https');
  const http = require('http');
  const protocol = SELF_URL.startsWith('https') ? https : http;

  setInterval(() => {
    protocol.get(`${SELF_URL}/api/health`, (res) => {
      if (res.statusCode === 200) {
        console.log(`Self-ping successful (${new Date().toLocaleTimeString()}): Service kept alive`);
      } else {
        console.warn(`Self-ping warning: Status code ${res.statusCode}`);
      }
    }).on('error', (err) => {
      console.error('Self-ping error:', err.message);
    });
  }, 14 * 60 * 1000); // 14 minutes
}

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`[STARTUP] Server successfully listening on port ${PORT}`);
  console.log(`[STARTUP] Mode: ${process.env.NODE_ENV || 'development'}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`FATAL ERROR (Unhandled Rejection): ${err.message}`);
  if (err.stack) console.error(err.stack);
  // Close server & exit process to allow orchestrator to restart
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`FATAL ERROR (Uncaught Exception): ${err.message}`);
  if (err.stack) console.error(err.stack);
  server.close(() => process.exit(1));
});
