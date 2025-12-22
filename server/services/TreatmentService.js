const TreatmentPlanRepository = require('../repositories/TreatmentPlanRepository');
const UserRepository = require('../repositories/UserRepository');

class TreatmentService {
    /**
     * Create treatment plan
     * @param {Object} planData - Treatment plan data
     * @param {string} doctorId - Doctor ID from authenticated user
     * @returns {Promise<Object>} Created treatment plan
     * @throws {Error} If patient not found or invalid
     */
    async createTreatmentPlan(planData, doctorId) {
        const { patientId, diagnosis, startDate, expectedDays, medications, symptomChecklist } = planData;

        // Business validation: Verify patient exists and has correct role
        const patient = await UserRepository.findById(patientId);
        if (!patient || patient.role !== 'PATIENT') {
            throw new Error('Patient not found');
        }

        // Create treatment plan
        const plan = await TreatmentPlanRepository.create({
            patientId,
            doctorId,
            diagnosis,
            startDate,
            expectedDays,
            medications,
            symptomChecklist
        });

        return plan;
    }

    /**
     * Get treatment plans based on user role
     * @param {string} userId - User ID
     * @param {string} role - User role
     * @param {Object} filters - Additional filters
     * @returns {Promise<Array>} Array of treatment plans
     */
    async getTreatmentPlans(userId, role, filters = {}) {
        let query = {};

        // Business logic: Filter based on role
        if (role === 'PATIENT') {
            query = { patientId: userId };
        } else if (role === 'DOCTOR') {
            query = { doctorId: userId };
            // Allow filtering by patientId if provided
            if (filters.patientId) {
                query.patientId = filters.patientId;
            }
        }

        const plans = await TreatmentPlanRepository.findByQuery(query, {
            patient: true,
            doctor: true
        });

        return plans;
    }

    /**
     * Get single treatment plan with authorization
     * @param {string} planId - Treatment plan ID
     * @param {string} userId - User ID
     * @param {string} role - User role
     * @returns {Promise<Object>} Treatment plan
     * @throws {Error} If plan not found or user not authorized
     */
    async getTreatmentPlanById(planId, userId, role) {
        const plan = await TreatmentPlanRepository.findById(planId, {
            patient: true,
            doctor: true
        });

        if (!plan) {
            throw new Error('Treatment plan not found');
        }

        // Business validation: Authorization check
        if (role === 'PATIENT' && plan.patientId._id.toString() !== userId) {
            throw new Error('Not authorized');
        }
        if (role === 'DOCTOR' && plan.doctorId._id.toString() !== userId) {
            throw new Error('Not authorized');
        }

        return plan;
    }

    /**
     * Get active treatment plan summary
     * @param {string} patientId - Patient ID
     * @param {string} doctorId - Doctor ID
     * @returns {Promise<Object|null>} Treatment plan summary or null
     */
    async getTreatmentSummary(patientId, doctorId) {
        const plan = await TreatmentPlanRepository.findActiveByPatient(patientId, doctorId);

        if (!plan) {
            return null;
        }

        // Construct lightweight payload
        return {
            patient: {
                name: plan.patientId.name,
                email: plan.patientId.email
            },
            treatment: {
                diagnosis: plan.diagnosis,
                startDate: plan.startDate,
                status: plan.status,
                medications: plan.medications.map(m => m.name)
            }
        };
    }

    /**
     * Update patient consent
     * @param {string} planId - Treatment plan ID
     * @param {string} userId - User ID
     * @param {Object} consentData - Consent data
     * @returns {Promise<Object>} Updated treatment plan
     * @throws {Error} If plan not found or user not authorized
     */
    async updateConsent(planId, userId, consentData) {
        const { monitoring, messaging } = consentData;

        const plan = await TreatmentPlanRepository.findById(planId);

        if (!plan) {
            throw new Error('Treatment plan not found');
        }

        // Business validation: Verify user is the patient
        if (plan.patientId.toString() !== userId) {
            throw new Error('Not authorized');
        }

        // Update consent
        plan.consent = {
            monitoring: !!monitoring,
            messaging: !!messaging,
            signedAt: new Date()
        };

        await TreatmentPlanRepository.save(plan);
        return plan;
    }
}

module.exports = new TreatmentService();
