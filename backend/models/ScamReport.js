const mongoose = require('mongoose');

const scamReportSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['upi', 'domain', 'phone'],
    required: true
  },
  value: {
    type: String,
    required: true,
    index: true
  },
  reportCount: {
    type: Number,
    default: 1
  },
  reasons: [String],
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastReportedAt: {
    type: Date,
    default: Date.now
  },
  reporterHashes: {
    type: [String],
    default: []
  }
});

// Compound index for fast lookups by type + value
scamReportSchema.index({ type: 1, value: 1 }, { unique: true });

module.exports = mongoose.model('ScamReport', scamReportSchema);
