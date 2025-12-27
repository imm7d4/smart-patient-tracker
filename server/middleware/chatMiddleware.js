const Conversation = require('../models/Conversation');
const TreatmentPlan = require('../models/TreatmentPlan');

const chatGuard = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    console.log('ChatGuard Entry:', {path: req.path, method: req.method, userId, userRole});

    // 1. Block Admins
    if (userRole === 'ADMIN') {
      return res.status(403).json({success: false, message: 'Admins cannot access chat'});
    }

    // 2. Initialize/Get Conversation Logic
    if (req.path === '/conversations/init' && req.method === 'POST') {
      const {targetUserId} = req.body;

      // Validate Relationship via TreatmentPlan
      // Validate Relationship via TreatmentPlan
      const query = {
        status: 'ACTIVE',
        $or: [
          {patientId: userId, doctorId: targetUserId},
          {doctorId: userId, patientId: targetUserId},
        ],
      };

      console.log('Chat Init Query:', query);

      const plan = await TreatmentPlan.findOne(query);
      if (!plan) {
        console.log('No active plan found for chat init');
        // Temporarily allow for debugging if needed, but strictly this should block
        return res.status(403).json({success: false, message: 'No active treatment plan found with this user'});
      }

      console.log('Plan found:', plan._id);

      // Attach plan to request for controller to use
      req.treatmentPlan = plan;
      return next();
    }

    // Allow fetching contacts list without conversation checks
    if (req.path === '/contacts' && req.method === 'GET') {
      return next();
    }

    // 3. Existing Conversation Access Logic
    // Extract conversationId from params or body
    const conversationId = req.params?.conversationId || req.body?.conversationId || req.query?.conversationId;

    if (conversationId) {
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        return res.status(404).json({success: false, message: 'Conversation not found'});
      }

      // Verify Participation
      const isParticipant = conversation.participants.some((p) => p.toString() === userId);
      if (!isParticipant) {
        return res.status(403).json({success: false, message: 'Not a participant in this conversation'});
      }

      // Verify Active Status (for writing)
      if (req.method === 'POST' && !conversation.isActive) {
        return res.status(403).json({success: false, message: 'Conversation is closed'});
      }

      req.conversation = conversation;
    }

    next();
  } catch (error) {
    console.error('ChatGuard Error:', error);
    res.status(500).json({success: false, message: 'Server error in chat guard'});
  }
};

module.exports = {chatGuard};
