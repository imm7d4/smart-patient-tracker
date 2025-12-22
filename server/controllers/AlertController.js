const AlertService = require('../services/AlertService');

class AlertController {
    /**
     * Get alerts
     * GET /api/alerts
     */
    async getAlerts(req, res) {
        try {
            const alerts = await AlertService.getAlerts(req.user.id, req.query);
            res.json({ success: true, data: alerts });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * Acknowledge alert
     * PATCH /api/alerts/:id/acknowledge
     */
    async acknowledgeAlert(req, res) {
        try {
            const alert = await AlertService.acknowledgeAlert(req.params.id, req.user.id);
            res.json({ success: true, data: alert });
        } catch (error) {
            const statusCode = error.message === 'Alert not found' ? 404 :
                error.message === 'Not authorized' ? 403 : 500;
            res.status(statusCode).json({ success: false, message: error.message });
        }
    }
}

module.exports = new AlertController();
