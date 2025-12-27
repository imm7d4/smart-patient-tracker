const Alert = require('../models/Alert');

class AlertRepository {
  /**
     * Create alert
     * @param {Object} alertData - Alert data
     * @returns {Promise<Object>} Created alert
     */
  async create(alertData) {
    return await Alert.create(alertData);
  }

  /**
     * Find alerts for doctor
     * @param {string} doctorId - Doctor ID
     * @param {Object} filters - Additional filters
     * @returns {Promise<Array>} Array of alerts
     */
  async findByDoctor(doctorId, filters = {}) {
    const query = {doctorId, ...filters};
    return await Alert.find(query)
        .populate('patientId', 'name email')
        .sort({createdAt: -1});
  }

  /**
     * Find alert by ID
     * @param {string} id - Alert ID
     * @returns {Promise<Object|null>} Alert or null
     */
  async findById(id) {
    return await Alert.findById(id);
  }

  /**
     * Update alert status
     * @param {string} id - Alert ID
     * @param {string} status - New status
     * @returns {Promise<Object|null>} Updated alert
     */
  async updateStatus(id, status) {
    return await Alert.findByIdAndUpdate(
        id,
        {status, acknowledgedAt: new Date()},
        {new: true},
    );
  }

  /**
     * Count alerts by doctor and timeframe
     * @param {string} doctorId - Doctor ID
     * @param {Date} dateLimit - Date limit for filtering
     * @returns {Promise<number>} Count of alerts
     */
  async countByDoctorAndTimeframe(doctorId, dateLimit) {
    return await Alert.countDocuments({
      doctorId,
      createdAt: {$gte: dateLimit},
    });
  }
}

module.exports = new AlertRepository();
