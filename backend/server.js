require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { initWorker, terminateWorker } = require('./utils/ocr');

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'https://raksha-shield-orcin.vercel.app']
}));
app.use(express.json());

// Routes
app.use('/api/check-message', require('./routes/checkMessage'));
app.use('/api/check-link', require('./routes/checkLink'));
app.use('/api/check-upi', require('./routes/checkUPI'));
app.use('/api/check-voice', require('./routes/checkVoice'));
app.use('/api/report-scam', require('./routes/reportScam'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'rakshaShield-backend' });
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
      dbName: 'rakshashield'
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
