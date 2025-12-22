const ProfileService = require('../services/ProfileService');

class ProfileController {
    /**
     * Get profile
     * GET /api/profile
     */
    async getProfile(req, res) {
        try {
            const profile = await ProfileService.getProfile(req.user.id, req.user.role);
            res.json({ success: true, data: profile });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * Update profile
     * PUT /api/profile
     */
    async updateProfile(req, res) {
        try {
            const profile = await ProfileService.updateProfile(
                req.user.id,
                req.user.role,
                req.body
            );

            res.json({ success: true, data: profile });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new ProfileController();
