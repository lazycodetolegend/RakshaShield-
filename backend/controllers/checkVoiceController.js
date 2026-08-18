const axios = require('axios');
const FormData = require('form-data');
const CheckLog = require('../models/CheckLog');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

/**
 * POST /api/check-voice
 * Body: multipart/form-data with field "audio"
 */
async function checkVoice(req, res) {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: 'Audio file is required (supports .mp3, .wav, .ogg, .opus, .m4a)' });
    }

    const formData = new FormData();
    formData.append('audio', req.file.buffer, {
      filename: req.file.originalname || 'sample_voice.wav',
      contentType: req.file.mimetype || 'audio/wav',
    });

    // Forward to Python ML Microservice
    const mlResponse = await axios.post(`${ML_SERVICE_URL}/score-audio`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 180000, // 180s timeout for model download/inference
    });

    const { score, riskLevel, reasons, modelConfidence, label } = mlResponse.data;

    // Log the check if MongoDB is connected
    if (require('mongoose').connection.readyState === 1) {
      CheckLog.create({
        checkType: 'voice',
        inputSnippet: `Audio clip: ${req.file.originalname} (${(req.file.size / 1024).toFixed(1)} KB)`,
        riskLevel,
        reasons,
      }).catch((err) => console.error('Failed to log voice check:', err.message));
    }

    return res.json({
      riskLevel,
      score,
      reasons,
      modelConfidence,
      label,
      filename: req.file.originalname,
      fileSizeBytes: req.file.size,
    });
  } catch (err) {
    console.error('check-voice error:', err.message);
    if (err.code === 'ECONNREFUSED') {
      return res.status(503).json({ error: 'Audio ML service unavailable. Please ensure Python service is running.' });
    }
    if (err.response?.data?.detail) {
      return res.status(500).json({ error: `Audio analysis error: ${err.response.data.detail}` });
    }
    return res.status(500).json({ error: 'Failed to analyze voice audio' });
  }
}

module.exports = { checkVoice };
