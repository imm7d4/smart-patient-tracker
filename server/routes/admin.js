const express = require('express');
const router = express.Router();
const {protect} = require('../middleware/auth');
const {authorize} = require('../middleware/authorizeRole');
const AdminController = require('../controllers/AdminController');

// @route   GET /api/admin/stats
// @desc    Get system-wide statistics
// @access  Admin
router.get('/stats', protect, authorize('ADMIN'), AdminController.getStats.bind(AdminController));

// @route   GET /api/admin/stats/doctors
// @desc    Get aggregated stats per doctor (Workload monitoring)
// @access  Admin
router.get('/stats/doctors', protect, authorize('ADMIN'), AdminController.getDoctorStats.bind(AdminController));

// @route   GET /api/admin/users
// @desc    Get all users (including deleted)
// @access  Admin
router.get('/users', protect, authorize('ADMIN'), AdminController.getUsers.bind(AdminController));

// @route   PATCH /api/admin/users/:id/toggle-status
// @desc    Toggle user active/deleted status
// @access  Admin
router.patch('/users/:id/toggle-status', protect, authorize('ADMIN'), AdminController.toggleUserStatus.bind(AdminController));

// @route   GET /api/admin/audit-logs
// @desc    Get audit logs with pagination and filtering
// @access  Admin
router.get('/audit-logs', protect, authorize('ADMIN'), AdminController.getAuditLogs.bind(AdminController));

module.exports = router;
