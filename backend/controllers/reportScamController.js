const crypto = require('crypto');
const ScamReport = require('../models/ScamReport');

/**
 * Hash the requester's IP with SHA-256 for duplicate-reporter detection.
 * We don't store raw IPs — only the hash.
 */
function hashIP(ip) {
  return crypto.createHash('sha256').update(ip || 'unknown').digest('hex');
}

/**
 * POST /api/report-scam
 * Body: { type: 'upi'|'domain'|'phone', value: string, reason?: string }
 * 
 * Dedup: only increments reportCount if this IP hasn't already reported
 * this exact value. Accepts the request silently either way.
 */
async function reportScam(req, res) {
  try {
    const { type, value, reason } = req.body;

    // Validate type
    const validTypes = ['upi', 'domain', 'phone'];
    if (!type || !validTypes.includes(type)) {
      return res.status(400).json({ error: `Type must be one of: ${validTypes.join(', ')}` });
    }

    // Validate value
    if (!value || !value.trim()) {
      return res.status(400).json({ error: 'Value is required' });
    }

    const normalizedValue = value.trim().toLowerCase();

    if (require('mongoose').connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database service is currently unreachable. Please ensure MongoDB Atlas IP is whitelisted.' });
    }

    const reporterHash = hashIP(req.ip);

    // Check if this reporter already filed for this value
    const existing = await ScamReport.findOne({ type, value: normalizedValue });

    if (existing && existing.reporterHashes && existing.reporterHashes.includes(reporterHash)) {
      // Already reported by this IP — accept silently, don't double-count
      return res.json({
        message: 'Report submitted successfully. Thank you for helping keep others safe.',
        reportCount: existing.reportCount
      });
    }

    // Build the update
    const updateFields = {
      $inc: { reportCount: 1 },
      $set: { lastReportedAt: new Date() },
      $addToSet: { reporterHashes: reporterHash },
      $setOnInsert: {
        type,
        value: normalizedValue,
        createdAt: new Date()
      }
    };

    // Push reason if provided
    if (reason && reason.trim()) {
      if (!updateFields.$push) updateFields.$push = {};
      updateFields.$push.reasons = reason.trim();
    }

    const report = await ScamReport.findOneAndUpdate(
      { type, value: normalizedValue },
      updateFields,
      { upsert: true, new: true }
    );

    return res.json({
      message: 'Report submitted successfully. Thank you for helping keep others safe.',
      reportCount: report.reportCount
    });
  } catch (err) {
    console.error('report-scam error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { reportScam };
