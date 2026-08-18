const mongoose = require('mongoose');

const checkLogSchema = new mongoose.Schema({
  checkType: {
    type: String,
    enum: ['message', 'link', 'upi', 'voice'],
    required: true
  },
  inputSnippet: String,
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: true
  },
  reasons: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('CheckLog', checkLogSchema);
