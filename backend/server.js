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

// Health check endpoints
app.get('/', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Exam-OS API is running', timestamp: new Date().toISOString() });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Self-ping to keep service alive (if RENDER_EXTERNAL_URL is set)
let SELF_URL = process.env.RENDER_EXTERNAL_URL;
if (SELF_URL) {
  // Remove trailing slash if present
  if (SELF_URL.endsWith('/')) {
    SELF_URL = SELF_URL.slice(0, -1);
  }
  
  const https = require('https');
  setInterval(() => {
    https.get(`${SELF_URL}/api/health`, (res) => {
      if (res.statusCode === 200) {
        console.log('Self-ping successful: Service kept alive');
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
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  // server.close(() => process.exit(1));
});
