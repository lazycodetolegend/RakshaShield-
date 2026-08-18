const express = require('express');
const { rateLimit } = require('express-rate-limit');
const { reportScam } = require('../controllers/reportScamController');

const router = express.Router();

// Rate limit: max 5 reports per IP per hour
const reportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many reports from this device. Try again later.' }
});

router.post('/', reportLimiter, reportScam);

module.exports = router;
