const PatientProfileRepository = require('../repositories/PatientProfileRepository');
const UserRepository = require('../repositories/UserRepository');

class ProfileService {
    /**
     * Get user profile
     * @param {string} userId - User ID
     * @param {string} role - User role
     * @returns {Promise<Object>} User profile
     */
    async getProfile(userId, role) {
        const user = await UserRepository.findById(userId);

        if (!user) {
            throw new Error('User not found');
        }

        // For patients, include patient profile
        if (role === 'PATIENT') {
            const patientProfile = await PatientProfileRepository.findByPatient(userId);
            return {
                user,
                profile: patientProfile
            };
        }

        return { user };
    }

    /**
     * Update user profile
     * @param {string} userId - User ID
     * @param {string} role - User role
     * @param {Object} updates - Profile updates
     * @returns {Promise<Object>} Updated profile
     */
    async updateProfile(userId, role, updates) {
        const { name, email, ...profileData } = updates;

        // Update user basic info if provided
        if (name || email) {
            await UserRepository.updateById(userId, { name, email });
        }

        // For patients, update patient profile
        if (role === 'PATIENT' && Object.keys(profileData).length > 0) {
            const updatedProfile = await PatientProfileRepository.updateByPatient(userId, profileData);
            return updatedProfile;
        }

        return await this.getProfile(userId, role);
    }
}

module.exports = new ProfileService();
