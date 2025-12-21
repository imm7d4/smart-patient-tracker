const mongoose = require('mongoose');

const dailyCheckInSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now },
    painLevel: { type: Number, min: 1, max: 10, required: true },
    temperature: { type: Number, required: true }, // in Fahrenheit
    medicationsTaken: { type: Boolean, required: true },
    symptoms: [{ type: String }],
    notes: { type: String },
    riskScore: { type: Number, default: 0 },
    riskLevel: { type: String, enum: ['NORMAL', 'WARNING', 'CRITICAL'], default: 'NORMAL' },
    riskReasons: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('DailyCheckIn', dailyCheckInSchema);
