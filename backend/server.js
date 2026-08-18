require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { initWorker, terminateWorker } = require('./utils/ocr');

const app = express();

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://raksha-shield-orcin.vercel.app',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app') || origin.includes('localhost')) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);
app.use(express.json());

// Routes
const checkMessageRouter = require('./routes/checkMessage');
const checkLinkRouter = require('./routes/checkLink');
const checkUPIRouter = require('./routes/checkUPI');
const checkVoiceRouter = require('./routes/checkVoice');
const reportScamRouter = require('./routes/reportScam');

// Mount under both /api and root to prevent 404s from misconfigured client baseURLs
app.use('/api/check-message', checkMessageRouter);
app.use('/check-message', checkMessageRouter);

app.use('/api/check-link', checkLinkRouter);
app.use('/check-link', checkLinkRouter);

app.use('/api/check-upi', checkUPIRouter);
app.use('/check-upi', checkUPIRouter);

app.use('/api/check-voice', checkVoiceRouter);
app.use('/check-voice', checkVoiceRouter);

app.use('/api/report-scam', reportScamRouter);
app.use('/report-scam', reportScamRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'rakshaShield-backend' });
});
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'rakshaShield-backend' });
});

// Root ping
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'RakshaShield API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 5000;

async function start() {
  // Start listening immediately so health checks work
  app.listen(PORT, () => {
    console.log(`RakshaShield backend running on port ${PORT}`);
  });

  // Connect to MongoDB (retry-friendly)
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'rakshashield',
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    console.error('Server is running but database features will not work.');
    console.error('Check: 1) Your MONGODB_URI in .env  2) Your IP is whitelisted in Atlas Network Access');
  }

  // Initialize OCR worker
  try {
    await initWorker();
  } catch (err) {
    console.error('OCR worker init failed:', err.message);
    console.error('Screenshot-to-text feature will not work.');
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down...');
  await terminateWorker();
  await mongoose.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down...');
  await terminateWorker();
  await mongoose.disconnect();
  process.exit(0);
});

start();
