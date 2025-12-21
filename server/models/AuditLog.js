const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userEmail: { type: String }, // redundant but useful if user is deleted hard
    action: { type: String, required: true }, // e.g. POST /api/checkins
    method: { type: String, required: true },
    url: { type: String, required: true },
    ip: { type: String },
    details: { type: Object },
    targetId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // The user being acted upon
    userAgent: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
