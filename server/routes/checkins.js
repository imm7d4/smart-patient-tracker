const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorizeRole');
const DailyCheckIn = require('../models/DailyCheckIn');
const { calculateRisk } = require('../services/riskEngine.service');

// @route   POST /api/checkins
// @desc    Submit daily check-in (Patient only)
// @access  Private/Patient
router.post('/', protect, async (req, res) => {
    if (req.user.role !== 'PATIENT') {
        return res.status(403).json({ success: false, message: 'Only patients can check in' });
    }

    // Check if already checked in today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const existing = await DailyCheckIn.findOne({
        patientId: req.user.id,
        createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    if (existing) {
        return res.status(400).json({ success: false, message: 'Already checked in today' });
    }

    const Alert = require('../models/Alert');
    const TreatmentPlan = require('../models/TreatmentPlan');
    const User = require('../models/User');

    try {
        const { painLevel, temperature, medicationsTaken, symptoms, notes } = req.body;

        // Fetch Active Treatment Plan to get Risk Config
        const plan = await TreatmentPlan.findOne({
            patientId: req.user.id,
            status: 'ACTIVE'
        });

        // Use plan config or default empty object (logic handles defaults)
        const riskConfig = plan ? plan.riskConfig : {};

        // Fetch previous check-in for trend analysis
        const previousCheckIn = await DailyCheckIn.findOne({
            patientId: req.user.id,
            createdAt: { $lt: startOfDay }
        }).sort({ createdAt: -1 });

        const riskAnalysis = calculateRisk(
            { painLevel, temperature, medicationsTaken, symptoms },
            previousCheckIn,
            riskConfig // Pass dynamic config
        );

        const checkIn = await DailyCheckIn.create({
            patientId: req.user.id,
            painLevel,
            temperature,
            medicationsTaken,
            symptoms,
            notes,
            riskScore: riskAnalysis.score,
            riskLevel: riskAnalysis.level,
            riskReasons: riskAnalysis.reasons
        });

        // ---------------------------------------------------------
        // MILESTONE LOGIC
        // ---------------------------------------------------------
        const unlockedMilestones = [];

        if (plan) {
            let planModified = false;
            const { painImprovementTarget = 30, medicationStreakDays = 7 } = plan.milestoneConfig || {};

            // Helper to check deduplication
            const hasMilestone = (type) => plan.milestones && plan.milestones.some(m => m.type === type);
            const { sendSystemMessage } = require('../services/chatService'); // Import here or top level

            // 1. Pain Improvement
            if (!hasMilestone('PAIN_IMPROVEMENT')) {
                // Fetch first ever check-in for this plan context
                // Rough proxy: first check-in since plan start date
                const firstCheckIn = await DailyCheckIn.findOne({
                    patientId: req.user.id,
                    createdAt: { $gte: plan.startDate }
                }).sort({ createdAt: 1 });

                if (firstCheckIn && firstCheckIn.painLevel > 0) {
                    const improvement = ((firstCheckIn.painLevel - painLevel) / firstCheckIn.painLevel) * 100;
                    if (improvement >= painImprovementTarget) {
                        const m = {
                            type: 'PAIN_IMPROVEMENT',
                            metaData: { improvement: Math.round(improvement), originalPain: firstCheckIn.painLevel, currentPain: painLevel }
                        };
                        plan.milestones.push(m);
                        unlockedMilestones.push(m);
                        planModified = true;

                        // Inject Chat Message
                        sendSystemMessage(plan._id, `🎉 Milestone Unlocked: Pain reduced by ${Math.round(improvement)}%!`, 'MILESTONE');
                    }
                }
            }

            // 2. Medication Streak
            if (!hasMilestone('MEDICATION_STREAK')) {
                // Check last N days
                const recentCheckIns = await DailyCheckIn.find({
                    patientId: req.user.id
                })
                    .sort({ createdAt: -1 })
                    .limit(medicationStreakDays);

                if (recentCheckIns.length >= medicationStreakDays) {
                    const allTaken = recentCheckIns.every(c => c.medicationsTaken);
                    if (allTaken) {
                        const m = {
                            type: 'MEDICATION_STREAK',
                            metaData: { days: medicationStreakDays }
                        };
                        plan.milestones.push(m);
                        unlockedMilestones.push(m);
                        planModified = true;

                        // Inject Chat Message
                        sendSystemMessage(plan._id, `🔥 Milestone Unlocked: ${medicationStreakDays} Day Medication Streak!`, 'MILESTONE');
                    }
                }
            }

            if (planModified) {
                await plan.save();
            }
        }
        // ---------------------------------------------------------

        // ALERT TRIGGERING LOGIC
        if (riskAnalysis.score >= 31) { // Trigger for WARNING or CRITICAL
            console.log(`[ALERT DEBUG] High Risk: ${riskAnalysis.score} for User: ${req.user.id}`);

            const user = await User.findById(req.user.id);

            if (plan) {
                const alert = await Alert.create({
                    patientId: req.user.id,
                    doctorId: plan.doctorId,
                    type: 'RISK_HIGH',
                    message: `High Risk detected for ${user ? user.name : 'Patient'}. Score: ${riskAnalysis.score}. Reasons: ${riskAnalysis.reasons.join(', ')}`,
                    riskScore: riskAnalysis.score
                });
                console.log('[ALERT DEBUG] Alert Created:', alert);

                // Inject System Message
                try {
                    const { sendSystemMessage } = require('../services/chatService');
                    await sendSystemMessage(plan._id, `⚠️ High Risk Alert: ${riskAnalysis.score}. ${riskAnalysis.reasons.join(', ')}`, 'ALERT');
                } catch (chatErr) {
                    console.error('[CheckIn] Failed to send chat alert:', chatErr);
                }

            } else {
                console.log('[ALERT DEBUG] No Active Plan - Alert Skipped');
            }
        }

        res.status(201).json({ success: true, data: checkIn, milestones: unlockedMilestones });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/checkins/history
// @desc    Get check-in history for logged in patient
// @access  Private/Patient
router.get('/history', protect, async (req, res) => {
    try {
        const checkins = await DailyCheckIn.find({ patientId: req.user.id }).sort({ createdAt: -1 });
        res.json({ success: true, data: checkins });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/checkins/dashboard
// @desc    Get latest status of all patients (Doctor only)
// @access  Doctor
router.get('/dashboard', protect, authorize('DOCTOR'), async (req, res) => {
    try {
        const statuses = await DailyCheckIn.aggregate([
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: "$patientId",
                    latestCheckIn: { $first: "$$ROOT" }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "patientInfo"
                }
            },
            { $unwind: "$patientInfo" },
            {
                $project: {
                    "patientInfo.password": 0,
                    "patientInfo.__v": 0
                }
            }
        ]);
        res.json({ success: true, data: statuses });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/checkins/history/:patientId
// @desc    Get check-in history for a specific patient (Doctor only)
// @access  Doctor
router.get('/history/:patientId', protect, authorize('DOCTOR'), async (req, res) => {
    try {
        const checkins = await DailyCheckIn.find({ patientId: req.params.patientId }).sort({ createdAt: 1 });
        res.json({ success: true, data: checkins });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
