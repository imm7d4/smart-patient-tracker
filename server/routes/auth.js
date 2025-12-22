const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', AuthController.register.bind(AuthController));

// @route   POST /api/auth/login
// @desc    Auth user & get token
// @access  Public
router.post('/login', AuthController.login.bind(AuthController));

module.exports = router;
