const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorizeRole');
const User = require('../models/User');

// @route   GET /api/users/patients
// @desc    Get all patients (Doctor only)
// @access  Private/Doctor
router.get('/patients', protect, authorize('DOCTOR'), async (req, res) => {
    try {
        const patients = await User.find({ role: 'PATIENT' }).select('-password');
        res.json({ success: true, data: patients });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
