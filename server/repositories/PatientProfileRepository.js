const PatientProfile = require('../models/PatientProfile');

class PatientProfileRepository {
    /**
     * Find profile by patient ID
     * @param {string} patientId - Patient ID
     * @returns {Promise<Object|null>} Patient profile or null
     */
    async findByPatient(patientId) {
        return await PatientProfile.findOne({ patientId });
    }

    /**
     * Create patient profile
     * @param {Object} profileData - Profile data
     * @returns {Promise<Object>} Created profile
     */
    async create(profileData) {
        return await PatientProfile.create(profileData);
    }

    /**
     * Update profile by patient ID
     * @param {string} patientId - Patient ID
     * @param {Object} updates - Update data
     * @returns {Promise<Object|null>} Updated profile
     */
    async updateByPatient(patientId, updates) {
        return await PatientProfile.findOneAndUpdate(
            { patientId },
            updates,
            { new: true, upsert: true }
        );
    }
}

module.exports = new PatientProfileRepository();
