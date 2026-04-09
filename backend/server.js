require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const responseTime = require('response-time');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

console.log(`[STARTUP] Setting up Exam-OS Backend...`);
console.log(`[STARTUP] Environment: ${process.env.NODE_ENV || 'development'}`);

// 1. IMMEDIATE HEALTH CHECKS (Before any complex middleware/routers)
app.get('/', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Exam-OS API is online', timestamp: new Date().toISOString() });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Service Healthy', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 2. MIDDLEWARE
app.use(express.json());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}
app.use(responseTime());
app.use(helmet({
  contentSecurityPolicy: false, // Avoid CSP issues during troubleshooting
}));
app.use(cors());
app.use(compression());

// 3. ROUTES (Imported inside startup to handle potential errors better)
try {
  const auth = require('./routes/auth');
  const exams = require('./routes/exam');
  const users = require('./routes/user');
  const bulk = require('./routes/bulk');

  app.use('/api/auth', auth);
  app.use('/api/exams', exams);
  app.use('/api/users', users);
  app.use('/api/bulk', bulk);
} catch (err) {
  console.error('[CRITICAL] Failed to load routes:', err.message);
}

// 4. BIND TO PORT IMMEDIATELY
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[STARTUP] Server bound to 0.0.0.0:${PORT} successfully`);
  
  // 5. BACKGROUND BACKGROUND TASKS (Only after binding)
  const { syncDB } = require('./models');
  const seedData = require('./db/seed');
  
  syncDB().then(() => {
    seedData().catch(err => console.error('[SEED] Seeding failed:', err.message));
  }).catch(err => {
    console.error('[DB] Initial sync error (Server remains up):', err.message);
  });
});

// 6. SELF-PING (Refined)
const SELF_URL = process.env.RENDER_EXTERNAL_URL;
if (SELF_URL) {
  const protocol = SELF_URL.startsWith('https') ? require('https') : require('http');
  setInterval(() => {
    protocol.get(`${SELF_URL}/api/health`, (res) => {
      if (res.statusCode !== 200) console.warn(`[PING] Warning: ${res.statusCode}`);
    }).on('error', (err) => console.error('[PING] Error:', err.message));
  }, 14 * 60 * 1000);
}

// 7. ROBUST ERROR HANDLING
const shutdown = (err, type) => {
  console.error(`[FATAL] ${type}:`, err.message || err);
  if (err.stack) console.error(err.stack);
  
  if (server) {
    server.close(() => {
      console.log('[SHUTDOWN] Server closed');
      process.exit(1);
    });
    // If it takes too long to close, force exit
    setTimeout(() => process.exit(1), 5000);
  } else {
    process.exit(1);
  }
};

process.on('unhandledRejection', (err) => shutdown(err, 'Unhandled Rejection'));
process.on('uncaughtException', (err) => shutdown(err, 'Uncaught Exception'));
