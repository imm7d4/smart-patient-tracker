const express = require('express');
const router = express.Router();
const {protect} = require('../middleware/auth');
const {authorize} = require('../middleware/authorizeRole');
const UserController = require('../controllers/UserController');

// @route   GET /api/users/patients
// @desc    Get all patients for doctor
// @access  Private/Doctor
router.get('/patients', protect, authorize('DOCTOR'), UserController.getPatients.bind(UserController));

// @route   GET /api/users/doctors
// @desc    Get all doctors
// @access  Private
router.get('/doctors', protect, UserController.getDoctors.bind(UserController));

module.exports = router;
