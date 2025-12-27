const UserRepository = require('../repositories/UserRepository');
const TreatmentPlanRepository = require('../repositories/TreatmentPlanRepository');

class UserService {
  /**
     * Get patients for doctor
     * @param {string} doctorId - Doctor ID
     * @returns {Promise<Array>} Array of patients
     */
  async getPatients(doctorId) {
    // Find all treatment plans for this doctor
    const plans = await TreatmentPlanRepository.findByQuery(
        {doctorId},
        {patient: true},
    );

    // Extract unique patients
    const patientsMap = new Map();
    plans.forEach((plan) => {
      if (plan.patientId && !patientsMap.has(plan.patientId._id.toString())) {
        patientsMap.set(plan.patientId._id.toString(), plan.patientId);
      }
    });

    return Array.from(patientsMap.values());
  }

  /**
     * Get all doctors
     * @returns {Promise<Array>} Array of doctors
     */
  async getDoctors() {
    const doctors = await UserRepository.findAll({role: 'DOCTOR', isDeleted: false});
    return doctors;
  }
}

module.exports = new UserService();
