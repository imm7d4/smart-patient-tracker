const express = require('express');
const router = express.Router();
const {protect} = require('../middleware/auth');
const {authorize} = require('../middleware/authorizeRole');
const AlertController = require('../controllers/AlertController');

// @route   GET /api/alerts
// @desc    Get alerts for logged in doctor
// @access  Doctor
router.get('/', protect, authorize('DOCTOR'), AlertController.getAlerts.bind(AlertController));

// @route   PATCH /api/alerts/:id/acknowledge
// @desc    Acknowledge alert
// @access  Doctor
router.patch('/:id/acknowledge', protect, authorize('DOCTOR'), AlertController.acknowledgeAlert.bind(AlertController));

module.exports = router;
