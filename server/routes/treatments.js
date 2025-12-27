const express = require('express');
const router = express.Router();
const {protect} = require('../middleware/auth');
const {authorize} = require('../middleware/authorizeRole');
const TreatmentController = require('../controllers/TreatmentController');

// @route   POST /api/treatments
// @desc    Create a treatment plan (Doctor only)
// @access  Private/Doctor
router.post('/', protect, authorize('DOCTOR'), TreatmentController.createTreatment.bind(TreatmentController));

// @route   GET /api/treatments
// @desc    Get all treatment plans for logged in user
// @access  Private
router.get('/', protect, TreatmentController.getTreatments.bind(TreatmentController));

// @route   GET /api/treatments/summary/:patientId
// @desc    Get active treatment plan summary (Doctor Only)
// @access  Private (Doctor)
router.get('/summary/:patientId', protect, TreatmentController.getTreatmentSummary.bind(TreatmentController));

// @route   GET /api/treatments/:id
// @desc    Get single treatment plan
// @access  Private
router.get('/:id', protect, TreatmentController.getTreatmentById.bind(TreatmentController));

// @route   PATCH /api/treatments/:id/consent
// @desc    Update patient consent for monitoring/messaging
// @access  Private (Patient Only)
router.patch('/:id/consent', protect, TreatmentController.updateConsent.bind(TreatmentController));

module.exports = router;
