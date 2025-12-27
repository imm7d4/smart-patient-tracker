const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  patientId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  doctorId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}, // Optional, maybe broadcast if null? For now specific doctor.
  type: {type: String, enum: ['RISK_HIGH', 'MISSED_CHECKIN'], required: true},
  message: {type: String, required: true},
  isRead: {type: Boolean, default: false},
  riskScore: {type: Number},
  status: {type: String, enum: ['ACTIVE', 'RESOLVED'], default: 'ACTIVE'},
}, {timestamps: true});

module.exports = mongoose.model('Alert', alertSchema);
