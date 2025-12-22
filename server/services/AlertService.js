const AlertRepository = require('../repositories/AlertRepository');

class AlertService {
    /**
     * Get alerts for doctor
     * @param {string} doctorId - Doctor ID
     * @param {Object} filters - Additional filters
     * @returns {Promise<Array>} Array of alerts
     */
    async getAlerts(doctorId, filters = {}) {
        const alerts = await AlertRepository.findByDoctor(doctorId, filters);
        return alerts;
    }

    /**
     * Acknowledge alert
     * @param {string} alertId - Alert ID
     * @param {string} doctorId - Doctor ID
     * @returns {Promise<Object>} Updated alert
     * @throws {Error} If alert not found or not authorized
     */
    async acknowledgeAlert(alertId, doctorId) {
        const alert = await AlertRepository.findById(alertId);

        if (!alert) {
            throw new Error('Alert not found');
        }

        // Business validation: Verify doctor owns this alert
        if (alert.doctorId.toString() !== doctorId) {
            throw new Error('Not authorized');
        }

        const updatedAlert = await AlertRepository.updateStatus(alertId, 'ACKNOWLEDGED');
        return updatedAlert;
    }
}

module.exports = new AlertService();
