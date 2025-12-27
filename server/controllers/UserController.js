const UserService = require('../services/UserService');

class UserController {
  /**
     * Get patients for doctor
     * GET /api/users/patients
     */
  async getPatients(req, res) {
    try {
      const patients = await UserService.getPatients(req.user.id);
      res.json({success: true, data: patients});
    } catch (error) {
      res.status(500).json({success: false, message: error.message});
    }
  }

  /**
     * Get all doctors
     * GET /api/users/doctors
     */
  async getDoctors(req, res) {
    try {
      const doctors = await UserService.getDoctors();
      res.json({success: true, data: doctors});
    } catch (error) {
      res.status(500).json({success: false, message: error.message});
    }
  }
}

module.exports = new UserController();
