const TreatmentService = require('../services/TreatmentService');

class TreatmentController {
  /**
     * Create treatment plan
     * POST /api/treatments
     */
  async createTreatment(req, res) {
    try {
      const {
        patientId, diagnosis, startDate, expectedDays,
        medications, symptomChecklist,
      } = req.body;

      // Basic shape validation
      if (!patientId || !diagnosis || !startDate) {
        return res.status(400).json({
          success: false,
          message: 'Please provide all required fields',
        });
      }

      const plan = await TreatmentService.createTreatmentPlan(
          {patientId, diagnosis, startDate, expectedDays, medications, symptomChecklist},
          req.user.id,
      );

      res.status(201).json({success: true, data: plan});
    } catch (error) {
      const statusCode = error.message === 'Patient not found' ? 404 : 500;
      res.status(statusCode).json({success: false, message: error.message});
    }
  }

  /**
     * Get treatment plans
     * GET /api/treatments
     */
  async getTreatments(req, res) {
    try {
      const plans = await TreatmentService.getTreatmentPlans(
          req.user.id,
          req.user.role,
          {patientId: req.query.patientId},
      );

      res.json({success: true, data: plans});
    } catch (error) {
      res.status(500).json({success: false, message: error.message});
    }
  }

  /**
     * Get single treatment plan
     * GET /api/treatments/:id
     */
  async getTreatmentById(req, res) {
    try {
      const plan = await TreatmentService.getTreatmentPlanById(
          req.params.id,
          req.user.id,
          req.user.role,
      );

      res.json({success: true, data: plan});
    } catch (error) {
      const statusCode = error.message === 'Treatment plan not found' ? 404 :
        error.message === 'Not authorized' ? 403 : 500;
      res.status(statusCode).json({success: false, message: error.message});
    }
  }

  /**
     * Get treatment summary
     * GET /api/treatments/summary/:patientId
     */
  async getTreatmentSummary(req, res) {
    try {
      // Business validation is in service
      if (req.user.role !== 'DOCTOR') {
        return res.status(403).json({success: false, message: 'Access denied. Doctor only.'});
      }

      const summary = await TreatmentService.getTreatmentSummary(
          req.params.patientId,
          req.user.id,
      );

      if (!summary) {
        return res.status(200).json({
          success: true,
          data: null,
          message: 'No active treatment plan found.',
        });
      }

      res.json({success: true, data: summary});
    } catch (error) {
      res.status(500).json({success: false, message: error.message});
    }
  }

  /**
     * Update consent
     * PATCH /api/treatments/:id/consent
     */
  async updateConsent(req, res) {
    try {
      const {monitoring, messaging} = req.body;

      const plan = await TreatmentService.updateConsent(
          req.params.id,
          req.user.id,
          {monitoring, messaging},
      );

      res.json({success: true, data: plan});
    } catch (error) {
      const statusCode = error.message === 'Treatment plan not found' ? 404 :
        error.message === 'Not authorized' ? 403 : 500;
      res.status(statusCode).json({success: false, message: error.message});
    }
  }
}

module.exports = new TreatmentController();
