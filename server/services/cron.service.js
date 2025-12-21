const TreatmentPlan = require('../models/TreatmentPlan');
const DailyCheckIn = require('../models/DailyCheckIn');
const Alert = require('../models/Alert');
const User = require('../models/User');

// allow simulatedDate for testing
const checkMissedSubmissions = async (simulatedDate) => {
    console.log('[Cron] Checking for missed submissions...');
    try {
        const activePlans = await TreatmentPlan.find({ status: 'ACTIVE' });

        for (const plan of activePlans) {
            // Determine frequency in hours
            let frequencyHours = 24;
            if (plan.checkInFrequency === 'ALTERNATE') frequencyHours = 48;
            if (plan.checkInFrequency === 'WEEKLY') frequencyHours = 168;

            // Get Last Check-in
            const lastCheckIn = await DailyCheckIn.findOne({ patientId: plan.patientId })
                .sort({ createdAt: -1 });

            // Reference time: Last Check-in OR Start Date
            const lastActivity = lastCheckIn ? new Date(lastCheckIn.createdAt) : new Date(plan.startDate);
            const now = simulatedDate ? new Date(simulatedDate) : new Date();
            const hoursSinceLast = (now - lastActivity) / (1000 * 60 * 60);

            // Logic: warning after Frequency + 24h, Critical after Frequency + 48h
            // Actually requirement says: "No check-in for 24h... Warning" (assuming daily).
            // Let's interpret strict requirement:
            // "24h past expected -> WARNING"

            const expectedTime = frequencyHours; // hours relative to last activity
            const lateHours = hoursSinceLast - expectedTime;

            if (lateHours >= 48) {
                // CRITICAL
                await generateAlert(plan, 'CRITICAL', 'Missed check-in (Critical). Patient unresponsive for > 48h past due.');
            } else if (lateHours >= 24) {
                // WARNING
                await generateAlert(plan, 'WARNING', 'Missed check-in (Warning). Patient late by > 24h.');
            }
        }
    } catch (error) {
        console.error('[Cron] Error:', error);
    }
};

const generateAlert = async (plan, level, message) => {
    const alertType = 'MISSED_CHECKIN'; // We categorize both levels as this type, differ by message content or we could add level to schema. 
    // Plan doesn't specify 'level' field in Alert, but we have 'type'.
    // Let's stick to type 'MISSED_CHECKIN' and handle idempotency.

    // Check if unresolved alert exists
    const existing = await Alert.findOne({
        patientId: plan.patientId,
        type: alertType,
        status: 'ACTIVE',
        message: message // Strict check to avoid duplicate criticals? Or just any missed checkin?
        // Better: if we have an active MISSED_CHECKIN, don't spam.
        // But we want to escalate Warning -> Critical. 
        // Strategy: specific check.
    });

    if (existing) {
        // If we want to escalate, we check if the existing one is Warning and new is Critical.
        // For simplicity: If ANY active missed checkin alert exists, we skip creating another UNLESS the message is different (Escalation).
        if (existing.message === message) {
            return; // Exactly same alert pending
        }

        // If existing is Warning and new is Critical, we might want to resolve old and create new, or just create new.
        // Implementation Plan says: "Check for existing *unresolved* Alert of same type... to prevent spam".

        // Let's resolve the old one if it was a Warning and we are now Critical.
        if (message.includes('Critical') && existing.message.includes('Warning')) {
            existing.status = 'RESOLVED';
            await existing.save();
            // And proceed to create Critical
        } else {
            return; // Skip (e.g. don't create Warning if Critical exists, or don't dupe Warning)
        }
    }

    const patient = await User.findById(plan.patientId);

    await Alert.create({
        patientId: plan.patientId,
        doctorId: plan.doctorId,
        type: alertType,
        message: `${message} (${patient ? patient.name : 'Unknown'})`,
        status: 'ACTIVE'
    });
    console.log(`[Cron] Alert created for ${plan.patientId}: ${message}`);

    // Inject System Message for Chat
    try {
        const { sendSystemMessage } = require('../services/chatService');
        await sendSystemMessage(plan._id, `⚠️ Alert: ${message}`, 'ALERT');
    } catch (err) {
        console.error('[Cron] Failed to send system message:', err);
    }
};

const initCron = () => {
    // Run every hour
    const INTERVAL = 60 * 60 * 1000;
    setInterval(checkMissedSubmissions, INTERVAL);

    // Initial run after 5 seconds to test/verify startup
    setTimeout(checkMissedSubmissions, 5000);

    console.log('[Cron] Service initialized');
};

module.exports = { initCron, checkMissedCheckins: checkMissedSubmissions };
