const CheckInService = require('../services/CheckInService');

class CheckInController {
    /**
     * Submit daily check-in
     * POST /api/checkins
     */
    async submitCheckIn(req, res) {
        try {
            // Basic role validation
            if (req.user.role !== 'PATIENT') {
                return res.status(403).json({ success: false, message: 'Only patients can check in' });
            }

            const { painLevel, temperature, medicationsTaken, symptoms, notes } = req.body;

            // Basic shape validation
            if (painLevel === undefined || temperature === undefined || medicationsTaken === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide all required fields'
                });
            }

            const result = await CheckInService.submitCheckIn(
                { painLevel, temperature, medicationsTaken, symptoms, notes },
                req.user.id
            );

            res.status(201).json({
                success: true,
                data: result.checkIn,
                milestones: result.milestones
            });
        } catch (error) {
            const statusCode = error.message === 'Already checked in today' ? 400 : 500;
            res.status(statusCode).json({ success: false, message: error.message });
        }
    }

    /**
     * Get check-in history
     * GET /api/checkins/history
     */
    async getHistory(req, res) {
        try {
            const checkins = await CheckInService.getCheckInHistory(
                req.user.id,
                req.user.role
            );

            res.json({ success: true, data: checkins });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * Get dashboard (doctor only)
     * GET /api/checkins/dashboard
     */
    async getDashboard(req, res) {
        try {
            const statuses = await CheckInService.getDashboard();
            res.json({ success: true, data: statuses });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * Get patient history (doctor only)
     * GET /api/checkins/history/:patientId
     */
    async getPatientHistory(req, res) {
        try {
            const checkins = await CheckInService.getCheckInHistory(
                req.user.id,
                req.user.role,
                req.params.patientId
            );

            res.json({ success: true, data: checkins });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new CheckInController();
