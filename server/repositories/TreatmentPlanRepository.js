const TreatmentPlan = require('../models/TreatmentPlan');

class TreatmentPlanRepository {
  /**
     * Create treatment plan
     * @param {Object} planData - Treatment plan data
     * @returns {Promise<Object>} Created treatment plan
     */
  async create(planData) {
    return await TreatmentPlan.create(planData);
  }

  /**
     * Find treatment plan by ID
     * @param {string} id - Treatment plan ID
     * @param {Object} populate - Fields to populate
     * @returns {Promise<Object|null>} Treatment plan or null
     */
  async findById(id, populate = {}) {
    let query = TreatmentPlan.findById(id);

    if (populate.patient) {
      query = query.populate('patientId', 'name email');
    }
    if (populate.doctor) {
      query = query.populate('doctorId', 'name email');
    }

    return await query;
  }

  /**
     * Find treatment plans by query
     * @param {Object} queryFilters - Query filters
     * @param {Object} populate - Fields to populate
     * @returns {Promise<Array>} Array of treatment plans
     */
  async findByQuery(queryFilters, populate = {}) {
    let query = TreatmentPlan.find(queryFilters);

    if (populate.patient) {
      query = query.populate('patientId', 'name email');
    }
    if (populate.doctor) {
      query = query.populate('doctorId', 'name email');
    }

    return await query;
  }

  /**
     * Find active treatment plan for patient
     * @param {string} patientId - Patient ID
     * @param {string} doctorId - Optional doctor ID filter
     * @returns {Promise<Object|null>} Active treatment plan or null
     */
  async findActiveByPatient(patientId, doctorId = null) {
    const query = {
      patientId,
      status: 'ACTIVE',
    };

    if (doctorId) {
      query.doctorId = doctorId;
    }

    return await TreatmentPlan.findOne(query).populate('patientId', 'name email');
  }

  /**
     * Update treatment plan by ID
     * @param {string} id - Treatment plan ID
     * @param {Object} updates - Update data
     * @returns {Promise<Object|null>} Updated treatment plan
     */
  async updateById(id, updates) {
    return await TreatmentPlan.findByIdAndUpdate(id, updates, {new: true});
  }

  /**
     * Save treatment plan (for complex updates)
     * @param {Object} plan - Treatment plan document
     * @returns {Promise<Object>} Saved treatment plan
     */
  async save(plan) {
    return await plan.save();
  }

  /**
     * Count treatment plans by status
     * @param {string} status - Plan status
     * @returns {Promise<number>} Count of plans
     */
  async countByStatus(status) {
    return await TreatmentPlan.countDocuments({status});
  }

  /**
     * Find treatment plans by IDs
     * @param {Array<string>} ids - Array of treatment plan IDs
     * @returns {Promise<Array>} Array of treatment plans
     */
  async findByIds(ids) {
    return await TreatmentPlan.find({_id: {$in: ids}});
  }
}

module.exports = new TreatmentPlanRepository();
