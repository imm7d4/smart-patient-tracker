const User = require('../models/User');

class UserRepository {
    /**
     * Find user by email
     * @param {string} email - User email
     * @returns {Promise<Object|null>} User document or null
     */
    async findByEmail(email) {
        return await User.findOne({ email });
    }

    /**
     * Find user by ID
     * @param {string} id - User ID
     * @returns {Promise<Object|null>} User document or null
     */
    async findById(id) {
        return await User.findById(id).select('-password');
    }

    /**
     * Create new user
     * @param {Object} userData - User data
     * @returns {Promise<Object>} Created user document
     */
    async create(userData) {
        return await User.create(userData);
    }

    /**
     * Find all users with optional filters
     * @param {Object} filters - Query filters
     * @returns {Promise<Array>} Array of user documents
     */
    async findAll(filters = {}) {
        return await User.find(filters).select('-password').sort({ createdAt: -1 });
    }

    /**
     * Update user by ID
     * @param {string} id - User ID
     * @param {Object} updates - Update data
     * @returns {Promise<Object|null>} Updated user document
     */
    async updateById(id, updates) {
        return await User.findByIdAndUpdate(id, updates, { new: true }).select('-password');
    }

    /**
     * Count users by role
     * @param {string} role - User role
     * @param {Object} additionalFilters - Additional query filters
     * @returns {Promise<number>} Count of users
     */
    async countByRole(role, additionalFilters = {}) {
        return await User.countDocuments({ role, ...additionalFilters });
    }

    /**
     * Aggregate doctor statistics
     * @param {number} days - Number of days for timeframe
     * @returns {Promise<Array>} Aggregated doctor stats
     */
    async aggregateDoctorStats(days) {
        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - days);

        return await User.aggregate([
            { $match: { role: 'DOCTOR', isDeleted: false } },
            {
                $lookup: {
                    from: 'treatmentplans',
                    localField: '_id',
                    foreignField: 'doctorId',
                    as: 'plans'
                }
            },
            {
                $lookup: {
                    from: 'alerts',
                    localField: '_id',
                    foreignField: 'doctorId',
                    as: 'allAlerts'
                }
            },
            {
                $project: {
                    name: 1,
                    email: 1,
                    plans: 1,
                    activePatients: {
                        $size: {
                            $filter: {
                                input: "$plans",
                                as: "plan",
                                cond: { $eq: ["$$plan.status", "ACTIVE"] }
                            }
                        }
                    },
                    totalAlerts: {
                        $size: {
                            $filter: {
                                input: "$allAlerts",
                                as: "alert",
                                cond: { $gte: ["$$alert.createdAt", dateLimit] }
                            }
                        }
                    },
                    criticalAlerts: {
                        $size: {
                            $filter: {
                                input: "$allAlerts",
                                as: "alert",
                                cond: {
                                    $and: [
                                        { $gte: ["$$alert.createdAt", dateLimit] },
                                        { $or: [{ $eq: ["$$alert.type", "RISK_HIGH"] }, { $eq: ["$$alert.type", "MISSED_CHECKIN"] }] }
                                    ]
                                }
                            }
                        }
                    }
                }
            },
            { $sort: { activePatients: -1 } }
        ]);
    }

    /**
     * Find users matching search criteria
     * @param {string} searchTerm - Search term
     * @returns {Promise<Array>} Matching users
     */
    async findBySearch(searchTerm) {
        const searchRegex = new RegExp(searchTerm, 'i');
        return await User.find({
            $or: [{ name: searchRegex }, { email: searchRegex }]
        }).select('_id');
    }
}

module.exports = new UserRepository();
