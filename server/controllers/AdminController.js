const AdminService = require('../services/AdminService');

class AdminController {
  /**
     * Get system statistics
     * GET /api/admin/stats
     */
  async getStats(req, res) {
    try {
      const stats = await AdminService.getSystemStats();
      res.json({success: true, data: stats});
    } catch (error) {
      res.status(500).json({success: false, message: error.message});
    }
  }

  /**
     * Get doctor statistics
     * GET /api/admin/stats/doctors
     */
  async getDoctorStats(req, res) {
    try {
      const {timeframe = '7'} = req.query;
      const days = parseInt(timeframe);

      const stats = await AdminService.getDoctorStats(days);
      res.json({success: true, data: stats});
    } catch (error) {
      res.status(500).json({success: false, message: error.message});
    }
  }

  /**
     * Get all users
     * GET /api/admin/users
     */
  async getUsers(req, res) {
    try {
      const users = await AdminService.getAllUsers();
      res.json({success: true, data: users});
    } catch (error) {
      res.status(500).json({success: false, message: error.message});
    }
  }

  /**
     * Toggle user status
     * PATCH /api/admin/users/:id/toggle-status
     */
  async toggleUserStatus(req, res) {
    try {
      const result = await AdminService.toggleUserStatus(req.params.id);

      // Set audit target for middleware
      req.audit = {targetId: result.user._id};

      res.json({
        success: true,
        message: result.message,
        data: result.user,
      });
    } catch (error) {
      const statusCode = error.message === 'User not found' ? 404 : 500;
      res.status(statusCode).json({success: false, message: error.message});
    }
  }

  /**
     * Get audit logs
     * GET /api/admin/audit-logs
     */
  async getAuditLogs(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 25;
      const {search, startDate, endDate, method} = req.query;

      const result = await AdminService.getAuditLogs(
          {search, startDate, endDate, method},
          page,
          limit,
      );

      res.json({
        success: true,
        data: result.logs,
        pagination: result.pagination,
      });
    } catch (error) {
      res.status(500).json({success: false, message: error.message});
    }
  }
}

module.exports = new AdminController();
