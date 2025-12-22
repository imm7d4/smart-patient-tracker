const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const ProfileController = require('../controllers/ProfileController');

// @route   GET /api/profile
// @desc    Get current user's profile
// @access  Private
router.get('/', protect, ProfileController.getProfile.bind(ProfileController));

// @route   PUT /api/profile
// @desc    Update user profile
// @access  Private
router.put('/', protect, ProfileController.updateProfile.bind(ProfileController));

module.exports = router;
