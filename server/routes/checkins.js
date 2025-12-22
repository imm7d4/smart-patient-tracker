const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorizeRole');
const CheckInController = require('../controllers/CheckInController');

// @route   POST /api/checkins
// @desc    Submit daily check-in (Patient only)
// @access  Private/Patient
router.post('/', protect, CheckInController.submitCheckIn.bind(CheckInController));

// @route   GET /api/checkins/history
// @desc    Get check-in history for logged in patient
// @access  Private/Patient
router.get('/history', protect, CheckInController.getHistory.bind(CheckInController));

// @route   GET /api/checkins/dashboard
// @desc    Get latest status of all patients (Doctor only)
// @access  Doctor
router.get('/dashboard', protect, authorize('DOCTOR'), CheckInController.getDashboard.bind(CheckInController));

// @route   GET /api/checkins/history/:patientId
// @desc    Get check-in history for a specific patient (Doctor only)
// @access  Doctor
router.get('/history/:patientId', protect, authorize('DOCTOR'), CheckInController.getPatientHistory.bind(CheckInController));

module.exports = router;
