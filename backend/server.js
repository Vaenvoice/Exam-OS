const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const { syncDB } = require('./models');
const seedData = require('./db/seed');

// Load env vars
dotenv.config();

// Connect and sync DB
syncDB().then(() => {
  if (process.env.NODE_ENV === 'development') {
    seedData();
  }
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
