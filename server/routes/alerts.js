const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorizeRole');
const Alert = require('../models/Alert');

// @route   GET /api/alerts
// @desc    Get alerts for logged in doctor
// @access  Doctor
router.get('/', protect, authorize('DOCTOR'), async (req, res) => {
    try {
        const alerts = await Alert.find({ doctorId: req.user.id })
            .populate('patientId', 'name email')
            .sort({ createdAt: -1 });
        res.json({ success: true, data: alerts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   PUT /api/alerts/:id/read
// @desc    Mark alert as read
// @access  Doctor
router.put('/:id/read', protect, authorize('DOCTOR'), async (req, res) => {
    try {
        const alert = await Alert.findById(req.params.id);
        if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });

        if (alert.doctorId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        alert.isRead = true;
        await alert.save();

        res.json({ success: true, data: alert });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
