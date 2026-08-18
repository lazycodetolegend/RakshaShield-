const axios = require('axios');
const CheckLog = require('../models/CheckLog');
const { recognizeText } = require('../utils/ocr');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

/**
 * Map numeric score to risk level.
 */
function getRiskLevel(score) {
  if (score <= 30) return 'low';
  if (score <= 60) return 'medium';
  return 'high';
}

/**
 * POST /api/check-message
 * Body: { text: string }
 */
async function checkMessage(req, res) {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Call Python microservice
    const mlResponse = await axios.post(`${ML_SERVICE_URL}/score-message`, {
      text: text.trim()
    });

    const { score, reasons } = mlResponse.data;
    const riskLevel = getRiskLevel(score);

    // Log the check (truncate input to 200 chars)
    await CheckLog.create({
      checkType: 'message',
      inputSnippet: text.substring(0, 200),
      riskLevel,
      reasons
    }).catch(err => console.error('Failed to log check:', err.message));

    return res.json({ riskLevel, score, reasons });
  } catch (err) {
    console.error('check-message error:', err.message);
    if (err.code === 'ECONNREFUSED') {
      return res.status(503).json({ error: 'ML service unavailable. Please try again later.' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * POST /api/check-message/ocr
 * Body: multipart/form-data with field "image"
 */
async function checkMessageOCR(req, res) {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    // Extract text via OCR
    const { text: extractedText, confidence } = await recognizeText(req.file.buffer);

    if (!extractedText || !extractedText.trim()) {
      return res.json({
        riskLevel: 'low',
        score: 0,
        reasons: ['Could not extract readable text from the image'],
        extractedText: '',
        ocrConfidence: confidence
      });
    }

    // Score the extracted text via Python microservice
    const mlResponse = await axios.post(`${ML_SERVICE_URL}/score-message`, {
      text: extractedText
    });

    const { score, reasons } = mlResponse.data;
    const riskLevel = getRiskLevel(score);

    // Log the check
    await CheckLog.create({
      checkType: 'message',
      inputSnippet: extractedText.substring(0, 200),
      riskLevel,
      reasons
    }).catch(err => console.error('Failed to log check:', err.message));

    return res.json({
      riskLevel,
      score,
      reasons,
      extractedText,
      ocrConfidence: confidence
    });
  } catch (err) {
    console.error('check-message/ocr error:', err.message);
    if (err.code === 'ECONNREFUSED') {
      return res.status(503).json({ error: 'ML service unavailable. Please try again later.' });
    }
    return res.status(500).json({ error: 'Failed to process image' });
  }
}

module.exports = { checkMessage, checkMessageOCR };
