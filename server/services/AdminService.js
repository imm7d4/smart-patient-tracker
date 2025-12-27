const UserRepository = require('../repositories/UserRepository');
const TreatmentPlanRepository = require('../repositories/TreatmentPlanRepository');
const DailyCheckInRepository = require('../repositories/DailyCheckInRepository');
const AuditLogRepository = require('../repositories/AuditLogRepository');
const ConversationRepository = require('../repositories/ConversationRepository');
const MessageRepository = require('../repositories/MessageRepository');

class AdminService {
  /**
     * Get system-wide statistics
     * @returns {Promise<Object>} System statistics
     */
  async getSystemStats() {
    // User counts
    const totalPatients = await UserRepository.countByRole('PATIENT', {isDeleted: false});
    const totalDoctors = await UserRepository.countByRole('DOCTOR', {isDeleted: false});

    // Treatment plans
    const activePlans = await TreatmentPlanRepository.countByStatus('ACTIVE');

    // Risk distribution (based on latest check-ins)
    const latestCheckIns = await DailyCheckInRepository.aggregateLatestByPatient();

    let highRiskCount = 0;
    let warningRiskCount = 0;
    let normalRiskCount = 0;

    latestCheckIns.forEach((item) => {
      const score = item.latestCheckIn.riskScore;
      if (score >= 61) highRiskCount++;
      else if (score >= 31) warningRiskCount++;
      else normalRiskCount++;
    });

    return {
      users: {
        patients: totalPatients,
        doctors: totalDoctors,
      },
      plans: {
        active: activePlans,
      },
      health: {
        critical: highRiskCount,
        warning: warningRiskCount,
        normal: normalRiskCount,
        total_tracked: latestCheckIns.length,
      },
    };
  }

  /**
     * Get doctor workload statistics
     * @param {number} timeframe - Number of days for timeframe
     * @returns {Promise<Array>} Doctor statistics
     */
  async getDoctorStats(timeframe = 7) {
    const doctorStats = await UserRepository.aggregateDoctorStats(timeframe);

    // Calculate SLA metrics for each doctor
    const enrichedStats = await Promise.all(doctorStats.map(async (doc) => {
      // Filter only active plans
      const activePlanIds = doc.plans.filter((p) => p.status === 'ACTIVE').map((p) => p._id);

      if (activePlanIds.length === 0) {
        return {...doc, avgResponseTime: 0, responseRate24h: 0};
      }

      // Find conversations for active plans
      const conversations = await Promise.all(
          activePlanIds.map((planId) => ConversationRepository.findByTreatmentPlan(planId)),
      );
      const conversationIds = conversations.filter((c) => c).map((c) => c._id);

      // Fetch messages (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const messages = await MessageRepository.findByConversation(
                conversationIds.length > 0 ? conversationIds[0] : null,
                {createdAt: {$gte: thirtyDaysAgo}},
                1000,
      );

      let totalResponseTime = 0;
      let responseCount = 0;
      let within24hCount = 0;
      let lastPatientMsgTime = null;

      messages.forEach((msg) => {
        const isSystem = msg.type !== 'USER';
        if (isSystem) return;

        const isDoctor = msg.sender && msg.sender.toString() === doc._id.toString();

        if (!isDoctor) {
          if (!lastPatientMsgTime) lastPatientMsgTime = msg.createdAt;
        } else {
          if (lastPatientMsgTime) {
            const diffMs = new Date(msg.createdAt) - new Date(lastPatientMsgTime);
            const diffHours = diffMs / (1000 * 60 * 60);

            totalResponseTime += diffHours;
            responseCount++;
            if (diffHours <= 24) within24hCount++;

            lastPatientMsgTime = null;
          }
        }
      });

      const avgResponseTime = responseCount > 0 ? (totalResponseTime / responseCount).toFixed(1) : 0;
      const responseRate24h = responseCount > 0 ? Math.round((within24hCount / responseCount) * 100) : 0;

      return {
        ...doc,
        avgResponseTime,
        responseRate24h,
      };
    }));

    return enrichedStats;
  }

  /**
     * Get all users
     * @returns {Promise<Array>} Array of all users
     */
  async getAllUsers() {
    const users = await UserRepository.findAll({});
    return users;
  }

  /**
     * Toggle user active/deleted status
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Updated user and message
     * @throws {Error} If user not found
     */
  async toggleUserStatus(userId) {
    const user = await UserRepository.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Business logic: Toggle isDeleted status
    const currentStatus = user.isDeleted === true;
    const updatedUser = await UserRepository.updateById(userId, {
      isDeleted: !currentStatus,
    });

    return {
      user: updatedUser,
      message: `User ${updatedUser.isDeleted ? 'deactivated' : 'activated'} successfully`,
    };
  }

  /**
     * Get audit logs with pagination and filtering
     * @param {Object} filters - Filter parameters
     * @param {number} page - Page number
     * @param {number} limit - Items per page
     * @returns {Promise<Object>} Paginated audit logs
     */
  async getAuditLogs(filters, page = 1, limit = 25) {
    const {search, startDate, endDate, method} = filters;

    const query = {};

    // Date filtering
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    // Method filtering
    if (method) {
      query.method = method;
    }

    // Search filtering
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      const matchingUsers = await UserRepository.findBySearch(search);
      const matchingUserIds = matchingUsers.map((u) => u._id);

      query.$or = [
        {userEmail: searchRegex},
        {ip: searchRegex},
        {url: searchRegex},
        {userId: {$in: matchingUserIds}},
      ];
    }

    const logs = await AuditLogRepository.findWithPagination(query, page, limit);
    const total = await AuditLogRepository.countByQuery(query);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
}

module.exports = new AdminService();
