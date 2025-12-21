const mongoose = require('mongoose');

const treatmentPlanSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    diagnosis: { type: String, required: true },
    startDate: { type: Date, required: true },
    expectedDays: { type: Number, required: true },
    medications: [{
        name: { type: String, required: true },
        dosage: { type: String, required: true },
        frequency: { type: String, required: true }
    }],
    symptomChecklist: [{ type: String }],
    status: { type: String, enum: ['ACTIVE', 'COMPLETED'], default: 'ACTIVE' },

    // Feature: Patient Consent
    consent: {
        monitoring: { type: Boolean, default: false },
        messaging: { type: Boolean, default: false },
        signedAt: { type: Date }
    },

    // Feature: Configurable Risk Rules
    riskConfig: {
        feverThreshold: { type: Number, default: 100.4 },
        painThreshold: { type: Number, default: 7 },
        medicationPenalty: { type: Number, default: 10 },
        enabledRules: {
            type: [String],
            default: ['PAIN_LEVEL', 'PAIN_TREND', 'FEVER', 'MEDICATION', 'SYMPTOMS_SEVERE', 'SYMPTOMS_MULTIPLE']
        }
    },

    // Feature: Missed Check-In Detection
    checkInFrequency: {
        type: String,
        enum: ['DAILY', 'ALTERNATE', 'WEEKLY'],
        default: 'DAILY'
    },

    // Feature: Recovery Milestones
    milestoneConfig: {
        painImprovementTarget: { type: Number, default: 30 }, // Percentage
        medicationStreakDays: { type: Number, default: 7 }
    },
    milestones: [{
        type: { type: String }, // e.g., 'PAIN_TARGET_MET', 'MEDICATION_STREAK'
        achievedAt: { type: Date, default: Date.now },
        metaData: { type: Object }
    }]
}, { timestamps: true });

module.exports = mongoose.model('TreatmentPlan', treatmentPlanSchema);
