const express = require('express');
const router = express.Router();
const PatientProfile = require('../models/PatientProfile');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/profile
// @desc    Get current user's patient profile
// @access  Private (Patient)
router.get('/', protect, authorize('PATIENT'), async (req, res) => {
    try {
        const profile = await PatientProfile.findOne({ user: req.user.id });
        if (!profile) {
            return res.status(404).json({ success: false, message: 'Profile not found' });
        }
        res.json({ success: true, data: profile });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   POST /api/profile
// @desc    Create or Update patient profile
// @access  Private (Patient)
router.post('/', protect, authorize('PATIENT'), async (req, res) => {
    try {
        const profileFields = {
            ...req.body,
            user: req.user.id
        };

        // Check if profile exists
        let profile = await PatientProfile.findOne({ user: req.user.id });

        if (profile) {
            // Update
            profile = await PatientProfile.findOneAndUpdate(
                { user: req.user.id },
                { $set: profileFields },
                { new: true }
            );
            return res.json({ success: true, message: 'Profile updated', data: profile });
        }

        // Create
        profile = new PatientProfile(profileFields);
        await profile.save();

        res.json({ success: true, message: 'Profile created', data: profile });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/profile/export
// @desc    Export patient data (check-ins, milestones, alerts)
// @access  Private (Patient)
router.get('/export', protect, authorize('PATIENT'), async (req, res) => {
    try {
        const TreatmentPlan = require('../models/TreatmentPlan');
        const DailyCheckIn = require('../models/DailyCheckIn');
        const Alert = require('../models/Alert');

        const plans = await TreatmentPlan.find({ patientId: req.user.id });
        const checkins = await DailyCheckIn.find({ patientId: req.user.id });
        const alerts = await Alert.find({ patientId: req.user.id });

        // Milestones are inside TreatmentPlan, so they are included in 'plans'

        const exportData = {
            exportedAt: new Date(),
            patientId: req.user.id,
            treatmentPlans: plans,
            checkIns: checkins,
            alerts: alerts
        };

        res.json({ success: true, data: exportData });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
