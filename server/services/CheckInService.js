const DailyCheckInRepository = require('../repositories/DailyCheckInRepository');
const TreatmentPlanRepository = require('../repositories/TreatmentPlanRepository');
const AlertRepository = require('../repositories/AlertRepository');
const UserRepository = require('../repositories/UserRepository');
const {calculateRisk} = require('./riskEngine.service');
const {sendSystemMessage} = require('./chatService');
const {getTodayRange} = require('../utils/date.util');

class CheckInService {
  /**
     * Submit daily check-in
     * @param {Object} checkInData - Check-in data
     * @param {string} userId - Patient user ID
     * @returns {Promise<Object>} Created check-in with milestones
     * @throws {Error} If already checked in today or other validation errors
     */
  async submitCheckIn(checkInData, userId) {
    const {painLevel, temperature, medicationsTaken, symptoms, notes} = checkInData;

    // Business validation: Check if already checked in today
    const {startOfDay, endOfDay} = getTodayRange();
    const existing = await DailyCheckInRepository.findTodayCheckIn(userId, startOfDay, endOfDay);

    if (existing) {
      throw new Error('Already checked in today');
    }

    // Fetch active treatment plan for risk config
    const plan = await TreatmentPlanRepository.findActiveByPatient(userId);
    const riskConfig = plan ? plan.riskConfig : {};

    // Fetch previous check-in for trend analysis
    const previousCheckIn = await DailyCheckInRepository.findPreviousCheckIn(userId, startOfDay);

    // Calculate risk
    const riskAnalysis = calculateRisk(
        {painLevel, temperature, medicationsTaken, symptoms},
        previousCheckIn,
        riskConfig,
    );

    // Create check-in
    const checkIn = await DailyCheckInRepository.create({
      patientId: userId,
      painLevel,
      temperature,
      medicationsTaken,
      symptoms,
      notes,
      riskScore: riskAnalysis.score,
      riskLevel: riskAnalysis.level,
      riskReasons: riskAnalysis.reasons,
    });

    // Calculate milestones
    const unlockedMilestones = await this.calculateMilestones(checkIn, plan, userId);

    // Trigger alerts if high risk
    await this.triggerAlerts(riskAnalysis, userId, plan);

    return {
      checkIn,
      milestones: unlockedMilestones,
    };
  }

  /**
     * Calculate and unlock milestones
     * @param {Object} checkIn - Current check-in
     * @param {Object} plan - Treatment plan
     * @param {string} userId - Patient user ID
     * @returns {Promise<Array>} Array of unlocked milestones
     */
  async calculateMilestones(checkIn, plan, userId) {
    const unlockedMilestones = [];

    if (!plan) return unlockedMilestones;

    let planModified = false;
    const {painImprovementTarget = 30, medicationStreakDays = 7} = plan.milestoneConfig || {};

    // Helper to check deduplication
    const hasMilestone = (type) => plan.milestones && plan.milestones.some((m) => m.type === type);

    // 1. Pain Improvement Milestone
    if (!hasMilestone('PAIN_IMPROVEMENT')) {
      const firstCheckIn = await DailyCheckInRepository.findFirstCheckInSinceDate(userId, plan.startDate);

      if (firstCheckIn && firstCheckIn.painLevel > 0) {
        const improvement = ((firstCheckIn.painLevel - checkIn.painLevel) / firstCheckIn.painLevel) * 100;
        if (improvement >= painImprovementTarget) {
          const milestone = {
            type: 'PAIN_IMPROVEMENT',
            metaData: {
              improvement: Math.round(improvement),
              originalPain: firstCheckIn.painLevel,
              currentPain: checkIn.painLevel,
            },
          };
          plan.milestones.push(milestone);
          unlockedMilestones.push(milestone);
          planModified = true;

          // Send system message
          await sendSystemMessage(
              plan._id,
              `🎉 Milestone Unlocked: Pain reduced by ${Math.round(improvement)}%!`,
              'MILESTONE',
          );
        }
      }
    }

    // 2. Medication Streak Milestone
    if (!hasMilestone('MEDICATION_STREAK')) {
      const recentCheckIns = await DailyCheckInRepository.findRecentCheckIns(userId, medicationStreakDays);

      if (recentCheckIns.length >= medicationStreakDays) {
        const allTaken = recentCheckIns.every((c) => c.medicationsTaken);
        if (allTaken) {
          const milestone = {
            type: 'MEDICATION_STREAK',
            metaData: {days: medicationStreakDays},
          };
          plan.milestones.push(milestone);
          unlockedMilestones.push(milestone);
          planModified = true;

          // Send system message
          await sendSystemMessage(
              plan._id,
              `🔥 Milestone Unlocked: ${medicationStreakDays} Day Medication Streak!`,
              'MILESTONE',
          );
        }
      }
    }

    if (planModified) {
      await TreatmentPlanRepository.save(plan);
    }

    return unlockedMilestones;
  }

  /**
     * Trigger alerts based on risk analysis
     * @param {Object} riskAnalysis - Risk analysis result
     * @param {string} userId - Patient user ID
     * @param {Object} plan - Treatment plan
     */
  async triggerAlerts(riskAnalysis, userId, plan) {
    // Business rule: Trigger alert for WARNING or CRITICAL risk
    if (riskAnalysis.score >= 31) {
      console.log(`[ALERT DEBUG] High Risk: ${riskAnalysis.score} for User: ${userId}`);

      const user = await UserRepository.findById(userId);

      if (plan) {
        const alert = await AlertRepository.create({
          patientId: userId,
          doctorId: plan.doctorId,
          type: 'RISK_HIGH',
          message: `High Risk detected for ${user ? user.name : 'Patient'}. Score: ${riskAnalysis.score}. Reasons: ${riskAnalysis.reasons.join(', ')}`,
          riskScore: riskAnalysis.score,
        });
        console.log('[ALERT DEBUG] Alert Created:', alert);

        // Send system message to chat
        try {
          await sendSystemMessage(
              plan._id,
              `⚠️ High Risk Alert: ${riskAnalysis.score}. ${riskAnalysis.reasons.join(', ')}`,
              'ALERT',
          );
        } catch (chatErr) {
          console.error('[CheckIn] Failed to send chat alert:', chatErr);
        }
      } else {
        console.log('[ALERT DEBUG] No Active Plan - Alert Skipped');
      }
    }
  }

  /**
     * Get check-in history
     * @param {string} userId - User ID
     * @param {string} role - User role
     * @param {string} patientId - Optional patient ID (for doctors)
     * @returns {Promise<Array>} Array of check-ins
     */
  async getCheckInHistory(userId, role, patientId = null) {
    // Business logic: Determine which patient's history to fetch
    const targetPatientId = role === 'PATIENT' ? userId : patientId;

    if (!targetPatientId) {
      throw new Error('Patient ID required');
    }

    const checkins = await DailyCheckInRepository.findByPatient(targetPatientId, -1);
    return checkins;
  }

  /**
     * Get doctor dashboard with latest patient statuses
     * @returns {Promise<Array>} Latest check-in statuses
     */
  async getDashboard() {
    const statuses = await DailyCheckInRepository.aggregateLatestByPatient();
    return statuses;
  }
}

module.exports = new CheckInService();
