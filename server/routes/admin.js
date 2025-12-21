const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorizeRole');
const User = require('../models/User');
const TreatmentPlan = require('../models/TreatmentPlan');
const DailyCheckIn = require('../models/DailyCheckIn');

// @route   GET /api/admin/stats
// @desc    Get system-wide statistics
// @access  Admin
router.get('/stats', protect, authorize('ADMIN'), async (req, res) => {
    try {
        // 1. User Counts
        const totalPatients = await User.countDocuments({ role: 'PATIENT', isDeleted: false });
        const totalDoctors = await User.countDocuments({ role: 'DOCTOR', isDeleted: false });

        // 2. Treatment Plans
        const activePlans = await TreatmentPlan.countDocuments({ status: 'ACTIVE' });

        // 3. Risk Distribution (Based on latest check-ins)
        // Aggregation to get latest check-in for each patient
        const latestCheckIns = await DailyCheckIn.aggregate([
            { $sort: { createdAt: -1 } },
            { $group: { _id: "$patientId", latest: { $first: "$$ROOT" } } }
        ]);

        let highRiskCount = 0;
        let warningRiskCount = 0;
        let normalRiskCount = 0;

        latestCheckIns.forEach(item => {
            const score = item.latest.riskScore;
            if (score >= 61) highRiskCount++;
            else if (score >= 31) warningRiskCount++;
            else normalRiskCount++;
        });

        res.json({
            success: true,
            data: {
                users: {
                    patients: totalPatients,
                    doctors: totalDoctors
                },
                plans: {
                    active: activePlans
                },
                health: {
                    critical: highRiskCount,
                    warning: warningRiskCount,
                    normal: normalRiskCount,
                    total_tracked: latestCheckIns.length
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});


// @route   GET /api/admin/stats/doctors
// @desc    Get aggregated stats per doctor (Workload monitoring)
// @access  Admin
router.get('/stats/doctors', protect, authorize('ADMIN'), async (req, res) => {
    try {
        const { timeframe = '7' } = req.query; // days, default 7
        const days = parseInt(timeframe);
        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - days);

        const doctorStats = await User.aggregate([
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
                                        // Assuming missed checkin is critical enough to count, or specific 'RISK_HIGH'
                                    ]
                                }
                            }
                        }
                    }
                }
            },
            { $sort: { activePatients: -1 } }
        ]);

        // 2. Calculate SLA Metrics (Avg Response Time & % < 24h)
        // This requires fetching messages, which is heavy, so we do it per doctor
        const Conversation = require('../models/Conversation'); // Ensure imported
        const Message = require('../models/Message'); // Ensure imported

        const enrichedStats = await Promise.all(doctorStats.map(async (doc) => {
            // Find all conversations for this doctor's active plans
            // We need to find plans first. The aggregation 'plans' field has them.
            // Filter only active plans
            const activePlanIds = doc.plans.filter(p => p.status === 'ACTIVE').map(p => p._id);

            if (activePlanIds.length === 0) {
                return { ...doc, avgResponseTime: 0, responseRate24h: 0 };
            }

            // Find Conversations
            const conversations = await Conversation.find({ treatmentPlanId: { $in: activePlanIds } }).select('_id');
            const conversationIds = conversations.map(c => c._id);

            // Fetch Messages (Optimize: last 30 days only)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const messages = await Message.find({
                conversationId: { $in: conversationIds },
                createdAt: { $gte: thirtyDaysAgo }
            }).sort({ createdAt: 1 }).select('sender createdAt type');

            let totalResponseTime = 0;
            let responseCount = 0;
            let within24hCount = 0;
            let lastPatientMsgTime = null;

            messages.forEach(msg => {
                const isSystem = msg.type !== 'USER'; // Ignore system msgs
                if (isSystem) return;

                const isDoctor = msg.sender && msg.sender.toString() === doc._id.toString();

                if (!isDoctor) {
                    // It's a patient (or someone else), mark time if not already waiting
                    if (!lastPatientMsgTime) lastPatientMsgTime = msg.createdAt;
                } else {
                    // It's the doctor
                    if (lastPatientMsgTime) {
                        const diffMs = new Date(msg.createdAt) - new Date(lastPatientMsgTime);
                        const diffHours = diffMs / (1000 * 60 * 60);

                        totalResponseTime += diffHours;
                        responseCount++;
                        if (diffHours <= 24) within24hCount++;

                        lastPatientMsgTime = null; // Reset
                    }
                }
            });

            const avgResponseTime = responseCount > 0 ? (totalResponseTime / responseCount).toFixed(1) : 0;
            const responseRate24h = responseCount > 0 ? Math.round((within24hCount / responseCount) * 100) : 0;

            return {
                ...doc,
                avgResponseTime, // Hours
                responseRate24h  // Percentage
            };
        }));

        res.json({ success: true, data: enrichedStats });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/admin/users
// @desc    Get all users (including deleted)
// @access  Admin
router.get('/users', protect, authorize('ADMIN'), async (req, res) => {
    try {
        // Return ALL users to support reactivation
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   PATCH /api/admin/users/:id/toggle-status
// @desc    Toggle user active/deleted status
// @access  Admin
router.patch('/users/:id/toggle-status', protect, authorize('ADMIN'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        // Toggle isDeleted status
        // If isDeleted is currently undefined (legacy), treat it as false, so new status becomes true
        const currentStatus = user.isDeleted === true;
        user.isDeleted = !currentStatus;

        await user.save();

        // Set Audit Target
        req.audit = { targetId: user._id };

        res.json({
            success: true,
            message: `User ${user.isDeleted ? 'deactivated' : 'activated'} successfully`,
            data: user
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

const AuditLog = require('../models/AuditLog');

// @route   GET /api/admin/audit-logs
// @desc    Get audit logs with pagination and filtering
// @access  Admin
router.get('/audit-logs', protect, authorize('ADMIN'), async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 25;
        const skip = (page - 1) * limit;

        const { search, startDate, endDate, method } = req.query;

        let query = {};

        // Date Filtering
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.createdAt.$lte = end;
            }
        }

        // Method Filtering
        if (method) {
            query.method = method;
        }

        // Search (User Email, IP, URL)
        // Finding User IDs matching name/email first if searching by user
        if (search) {
            const searchRegex = new RegExp(search, 'i');

            // Find users matching search
            const matchingUsers = await User.find({
                $or: [{ name: searchRegex }, { email: searchRegex }]
            }).select('_id');
            const matchingUserIds = matchingUsers.map(u => u._id);

            query.$or = [
                { userEmail: searchRegex },
                { ip: searchRegex },
                { url: searchRegex },
                { userId: { $in: matchingUserIds } }
            ];
        }

        const logs = await AuditLog.find(query)
            .populate('userId', 'name email role')
            .populate('targetId', 'name email') // Populate target user
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await AuditLog.countDocuments(query);

        res.json({
            success: true,
            data: logs,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
