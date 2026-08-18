const ScamReport = require('../models/ScamReport');
const CheckLog = require('../models/CheckLog');
const { Jimp } = require('jimp');
const jsQR = require('jsqr');

/**
 * Extract UPI ID from a payment link or return as-is if already a UPI ID.
 * UPI links look like: upi://pay?pa=someone@upi&pn=Name&am=100
 */
function extractUPIId(value) {
  const trimmed = value.trim();
  
  // Check if it's a UPI deep link
  if (trimmed.toLowerCase().startsWith('upi://')) {
    try {
      const url = new URL(trimmed);
      const pa = url.searchParams.get('pa');
      if (pa) return pa.toLowerCase();
    } catch {
      // Not a valid URL, fall through
    }
  }

  // Return as-is (assumed to be a UPI ID like name@bank)
  return trimmed.toLowerCase();
}

/**
 * Core UPI risk-assessment logic. Shared by both text and QR endpoints.
 * @param {string} upiId - Normalized UPI ID
 * @returns {{ riskLevel: string, reportCount: number, reasons: string[] }}
 */
async function assessUPIRisk(upiId) {
  let riskLevel = 'low';
  let reportCount = 0;
  let reasons = ['No prior reports found — this does not guarantee safety, only that no one has flagged it yet.'];

  // Check against community reports if DB is connected
  if (require('mongoose').connection.readyState === 1) {
    try {
      const report = await ScamReport.findOne({ type: 'upi', value: upiId });
      if (report) {
        reportCount = report.reportCount;
        if (reportCount >= 4) {
          riskLevel = 'high';
        } else if (reportCount >= 2) {
          riskLevel = 'medium';
        } else {
          riskLevel = 'low';
        }

        if (reportCount === 1) {
          reasons = ['1 report on file — worth caution but not yet a strong signal'];
        } else {
          reasons = [`Reported ${reportCount} times by distinct users`];
        }
        
        // Add community-provided reasons if any
        if (report.reasons && report.reasons.length > 0) {
          const uniqueReasons = [...new Set(report.reasons)].slice(0, 3);
          reasons.push(`Community reports mention: ${uniqueReasons.join('; ')}`);
        }
      }
    } catch (dbErr) {
      console.error('ScamReport lookup failed:', dbErr.message);
    }
  }

  // Log the check if DB connected
  if (require('mongoose').connection.readyState === 1) {
    CheckLog.create({
      checkType: 'upi',
      inputSnippet: upiId.substring(0, 200),
      riskLevel,
      reasons
    }).catch(err => console.error('Failed to log check:', err.message));
  }

  return { riskLevel, reportCount, reasons };
}

/**
 * POST /api/check-upi
 * Body: { value: string }
 */
async function checkUPI(req, res) {
  try {
    const { value } = req.body;
    if (!value || !value.trim()) {
      return res.status(400).json({ error: 'UPI ID or payment link is required' });
    }

    const upiId = extractUPIId(value);

    // Validate UPI ID format (should contain @)
    if (!upiId.includes('@')) {
      return res.status(400).json({ error: 'Invalid UPI ID format. Expected format: name@bank' });
    }

    const result = await assessUPIRisk(upiId);
    return res.json(result);
  } catch (err) {
    console.error('check-upi error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * POST /api/check-upi/qr
 * Body: multipart/form-data with field "image"
 * Decodes a QR code from the image, extracts UPI ID, runs same risk check.
 */
async function checkUPIQR(req, res) {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    // Decode image with Jimp to get raw pixel data
    let image;
    try {
      image = await Jimp.read(req.file.buffer);
    } catch (imgErr) {
      return res.status(400).json({ error: 'Could not read image file. Please upload a clear PNG or JPG.' });
    }

    const width = image.bitmap.width;
    const height = image.bitmap.height;
    const imageData = image.bitmap.data; // RGBA Uint8Array

    // Run jsQR to find and decode the QR code
    const qrResult = jsQR(imageData, width, height);

    if (!qrResult || !qrResult.data) {
      return res.status(400).json({ error: 'No valid UPI QR code detected in this image.' });
    }

    const rawQrContent = qrResult.data;

    // Extract UPI ID from QR payload (expects upi://pay?pa=...)
    const upiId = extractUPIId(rawQrContent);

    if (!upiId.includes('@')) {
      return res.status(400).json({
        error: 'No valid UPI QR code detected in this image.',
        rawQrContent,
        detail: 'QR code was read but does not contain a valid UPI payment address (pa= parameter).'
      });
    }

    // Run same risk assessment as text-based check
    const result = await assessUPIRisk(upiId);

    return res.json({
      ...result,
      decodedUpiId: upiId,
      rawQrContent
    });
  } catch (err) {
    console.error('check-upi/qr error:', err.message);
    return res.status(500).json({ error: 'Failed to process QR code image' });
  }
}

module.exports = { checkUPI, checkUPIQR, extractUPIId, assessUPIRisk };
