const mongoose = require('mongoose');

const statusSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: String,
    required: true
  },
  inProgress: { type: Number, default: 0 },
  onHold: { type: Number, default: 0 },
  jiraInProgress: { type: Number, default: 0 },
  acr: { type: Number, default: 0 },
  air: { type: Number, default: 0 },
  deEscalated: { type: Number, default: 0 },
  open: { type: Number, default: 0 },
  afr: { type: Number, default: 0 },
  anp: { type: Number, default: 0 },
  rcaPending: { type: Number, default: 0 },
  notes: { type: String, default: '' },
  submittedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Unique per name+date
statusSchema.index({ name: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Status', statusSchema);
