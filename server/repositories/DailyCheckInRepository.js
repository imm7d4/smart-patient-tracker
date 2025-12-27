const DailyCheckIn = require('../models/DailyCheckIn');

class DailyCheckInRepository {
  /**
     * Create daily check-in
     * @param {Object} checkInData - Check-in data
     * @returns {Promise<Object>} Created check-in
     */
  async create(checkInData) {
    return await DailyCheckIn.create(checkInData);
  }

  /**
     * Find check-ins for patient
     * @param {string} patientId - Patient ID
     * @param {number} sort - Sort order (1 for ascending, -1 for descending)
     * @returns {Promise<Array>} Array of check-ins
     */
  async findByPatient(patientId, sort = -1) {
    return await DailyCheckIn.find({patientId}).sort({createdAt: sort});
  }

  /**
     * Check if patient checked in today
     * @param {string} patientId - Patient ID
     * @param {Date} startOfDay - Start of day timestamp
     * @param {Date} endOfDay - End of day timestamp
     * @returns {Promise<Object|null>} Today's check-in or null
     */
  async findTodayCheckIn(patientId, startOfDay, endOfDay) {
    return await DailyCheckIn.findOne({
      patientId,
      createdAt: {$gte: startOfDay, $lte: endOfDay},
    });
  }

  /**
     * Get previous check-in before a specific date
     * @param {string} patientId - Patient ID
     * @param {Date} beforeDate - Date to search before
     * @returns {Promise<Object|null>} Previous check-in or null
     */
  async findPreviousCheckIn(patientId, beforeDate) {
    return await DailyCheckIn.findOne({
      patientId,
      createdAt: {$lt: beforeDate},
    }).sort({createdAt: -1});
  }

  /**
     * Get recent check-ins for patient
     * @param {string} patientId - Patient ID
     * @param {number} limit - Number of check-ins to retrieve
     * @returns {Promise<Array>} Array of recent check-ins
     */
  async findRecentCheckIns(patientId, limit) {
    return await DailyCheckIn.find({patientId})
        .sort({createdAt: -1})
        .limit(limit);
  }

  /**
     * Aggregate latest check-in per patient
     * @returns {Promise<Array>} Aggregated latest check-ins
     */
  async aggregateLatestByPatient() {
    return await DailyCheckIn.aggregate([
      {$sort: {createdAt: -1}},
      {
        $group: {
          _id: '$patientId',
          latestCheckIn: {$first: '$$ROOT'},
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'patientInfo',
        },
      },
      {$unwind: '$patientInfo'},
      {
        $project: {
          'patientInfo.password': 0,
          'patientInfo.__v': 0,
        },
      },
    ]);
  }

  /**
     * Find first check-in since a specific date
     * @param {string} patientId - Patient ID
     * @param {Date} sinceDate - Date to search from
     * @returns {Promise<Object|null>} First check-in or null
     */
  async findFirstCheckInSinceDate(patientId, sinceDate) {
    return await DailyCheckIn.findOne({
      patientId,
      createdAt: {$gte: sinceDate},
    }).sort({createdAt: 1});
  }
}

module.exports = new DailyCheckInRepository();
