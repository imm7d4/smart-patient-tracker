const AuditLog = require('../models/AuditLog');

class AuditLogRepository {
    /**
     * Create audit log
     * @param {Object} logData - Audit log data
     * @returns {Promise<Object>} Created audit log
     */
    async create(logData) {
        return await AuditLog.create(logData);
    }

    /**
     * Find audit logs with pagination
     * @param {Object} query - Query filters
     * @param {number} page - Page number
     * @param {number} limit - Items per page
     * @returns {Promise<Array>} Array of audit logs
     */
    async findWithPagination(query, page, limit) {
        const skip = (page - 1) * limit;

        return await AuditLog.find(query)
            .populate('userId', 'name email role')
            .populate('targetId', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
    }

    /**
     * Count audit logs by query
     * @param {Object} query - Query filters
     * @returns {Promise<number>} Count of logs
     */
    async countByQuery(query) {
        return await AuditLog.countDocuments(query);
    }
}

module.exports = new AuditLogRepository();
