const UserRepository = require('../repositories/UserRepository');
const TreatmentPlanRepository = require('../repositories/TreatmentPlanRepository');

class UserService {
  /**
     * Get patients for doctor
     * @param {string} doctorId - Doctor ID (kept for backward compatibility)
     * @returns {Promise<Array>} Array of all patients
     */
  async getPatients(doctorId) {
    // Return all users with role 'PATIENT'
    const patients = await UserRepository.findAll({ role: 'PATIENT' });
    return patients;
  }

  /**
     * Get all doctors
     * @returns {Promise<Array>} Array of doctors
     */
  async getDoctors() {
    const doctors = await UserRepository.findAll({ role: 'DOCTOR', isDeleted: false });
    return doctors;
  }
}

module.exports = new UserService();
