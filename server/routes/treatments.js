const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorizeRole');
const TreatmentPlan = require('../models/TreatmentPlan');
const User = require('../models/User');

// @route   POST /api/treatments
// @desc    Create a treatment plan (Doctor only)
// @access  Private/Doctor
router.post('/', protect, authorize('DOCTOR'), async (req, res) => {
    try {
        const { patientId, diagnosis, startDate, expectedDays, medications, symptomChecklist } = req.body;
        // Verify patient exists
        const patient = await User.findById(patientId);
        if (!patient || patient.role !== 'PATIENT') {
            return res.status(404).json({ success: false, message: 'Patient not found' });
        }

        const plan = await TreatmentPlan.create({
            patientId,
            doctorId: req.user.id,
            diagnosis,
            startDate,
            expectedDays,
            medications,
            symptomChecklist
        });
        res.status(201).json({ success: true, data: plan });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/treatments
// @desc    Get all treatment plans for logged in user
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'PATIENT') {
            query = { patientId: req.user.id };
        } else if (req.user.role === 'DOCTOR') {
            query = { doctorId: req.user.id };
            // Allow filtering by patientId if provided
            if (req.query.patientId) {
                query.patientId = req.query.patientId;
            }
        }

        const plans = await TreatmentPlan.find(query)
            .populate('patientId', 'name email')
            .populate('doctorId', 'name email');
        res.json({ success: true, data: plans });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/treatments/:id
// @desc    Get single treatment plan
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const plan = await TreatmentPlan.findById(req.params.id)
            .populate('patientId', 'name email')
            .populate('doctorId', 'name email');

        if (!plan) {
            return res.status(404).json({ success: false, message: 'Treatment plan not found' });
        }

        // Access check
        if (req.user.role === 'PATIENT' && plan.patientId._id.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        if (req.user.role === 'DOCTOR' && plan.doctorId._id.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        res.json({ success: true, data: plan });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/treatments/summary/:patientId
// @desc    Get active treatment plan summary (Doctor Only)
// @access  Private (Doctor)
router.get('/summary/:patientId', protect, async (req, res) => {
    try {
        const { patientId } = req.params;

        // Authorization: Doctor Only
        if (req.user.role !== 'DOCTOR') {
            return res.status(403).json({ success: false, message: 'Access denied. Doctor only.' });
        }

        // Fetch Active Plan
        const plan = await TreatmentPlan.findOne({
            patientId: patientId,
            doctorId: req.user.id,
            status: 'ACTIVE'
        }).populate('patientId', 'name email');

        if (!plan) {
            return res.status(200).json({
                success: true,
                data: null,
                message: 'No active treatment plan found.'
            });
        }

        // Construct Lightweight Payload
        const responseData = {
            patient: {
                name: plan.patientId.name,
                email: plan.patientId.email
                // age/gender not in schema
            },
            treatment: {
                diagnosis: plan.diagnosis,
                startDate: plan.startDate,
                status: plan.status,
                medications: plan.medications.map(m => m.name) // Simplified list
            }
        };

        res.json({ success: true, data: responseData });
    } catch (error) {
        console.error('Summary Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   PATCH /api/treatments/:id/consent
// @desc    Update patient consent for monitoring/messaging
// @access  Private (Patient Only)
router.patch('/:id/consent', protect, async (req, res) => {
    try {
        const { monitoring, messaging } = req.body;
        const plan = await TreatmentPlan.findById(req.params.id);

        if (!plan) {
            return res.status(404).json({ success: false, message: 'Treatment plan not found' });
        }

        // Verify user is the patient
        if (req.user.role !== 'PATIENT' || plan.patientId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // Update Consent
        plan.consent = {
            monitoring: !!monitoring,
            messaging: !!messaging,
            signedAt: new Date()
        };

        await plan.save();
        res.json({ success: true, data: plan });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
