const ConversationRepository = require('../repositories/ConversationRepository');
const MessageRepository = require('../repositories/MessageRepository');
const TreatmentPlanRepository = require('../repositories/TreatmentPlanRepository');

class ChatService {
  /**
     * Initialize or retrieve conversation
     * @param {string} userId - Current user ID
     * @param {string} targetUserId - Target user ID
     * @param {string} treatmentPlanId - Treatment plan ID
     * @returns {Promise<Object>} Conversation
     */
  async initConversation(userId, targetUserId, treatmentPlanId) {
    // Check if conversation already exists
    let conversation = await ConversationRepository.findByTreatmentPlan(treatmentPlanId);

    if (!conversation) {
      console.log('Creating new conversation for plan:', treatmentPlanId);
      conversation = await ConversationRepository.create({
        participants: [userId, targetUserId],
        treatmentPlanId,
        isActive: true,
      });

      // Send initial system message
      await MessageRepository.create({
        conversationId: conversation._id,
        type: 'SYSTEM',
        content: 'Secure chat initialized for this treatment plan.',
      });
    } else {
      console.log('Existing conversation found:', conversation._id);
    }

    return conversation;
  }

  /**
     * Get conversations for user
     * @param {string} userId - User ID
     * @returns {Promise<Array>} Array of conversations
     */
  async getConversations(userId) {
    const conversations = await ConversationRepository.findByParticipant(userId, {isActive: true});
    return conversations;
  }

  /**
     * Get messages for conversation
     * @param {string} conversationId - Conversation ID
     * @param {Date} since - Optional timestamp to get messages since
     * @param {number} limit - Message limit
     * @returns {Promise<Array>} Array of messages
     */
  async getMessages(conversationId, since = null, limit = 50) {
    let messages;

    if (since && since !== 'null' && since !== 'undefined') {
      const dateSince = new Date(since);
      if (!isNaN(dateSince.getTime())) {
        messages = await MessageRepository.findSince(conversationId, dateSince, limit);
      } else {
        messages = await MessageRepository.findByConversation(conversationId, {}, limit);
      }
    } else {
      messages = await MessageRepository.findByConversation(conversationId, {}, limit);
    }

    return messages;
  }

  /**
     * Send message
     * @param {string} conversationId - Conversation ID
     * @param {string} userId - Sender user ID
     * @param {string} content - Message content
     * @returns {Promise<Object>} Created message
     */
  async sendMessage(conversationId, userId, content) {
    // Create message
    const message = await MessageRepository.create({
      conversationId,
      sender: userId,
      content,
      type: 'USER',
    });

    // Update conversation
    await ConversationRepository.updateLastMessage(conversationId, message);

    return message;
  }

  /**
     * Mark conversation as read
     * @param {string} conversationId - Conversation ID
     * @param {string} userId - User ID
     * @param {Date} timestamp - Read timestamp
     */
  async markAsRead(conversationId, userId, timestamp) {
    await ConversationRepository.updateReadStatus(
        conversationId,
        userId,
        new Date(timestamp || Date.now()),
    );
  }

  /**
     * Get available contacts (users with active treatment plans)
     * @param {string} userId - User ID
     * @param {string} role - User role
     * @returns {Promise<Array>} Array of contacts
     */
  async getContacts(userId, role) {
    const query = {status: 'ACTIVE'};

    if (role === USER_ROLES.PATIENT) {
      query.patientId = userId;
    } else if (role === USER_ROLES.DOCTOR) {
      query.doctorId = userId;
    }

    const plans = await TreatmentPlanRepository.findByQuery(query, {
      patient: true,
      doctor: true,
    });

    // Extract unique contacts
    const contactsMap = new Map();

    plans.forEach((plan) => {
      const contact = role === USER_ROLES.PATIENT ? plan.doctorId : plan.patientId;
      if (contact && !contactsMap.has(contact._id.toString())) {
        contactsMap.set(contact._id.toString(), contact);
      }
    });

    return Array.from(contactsMap.values());
  }

  /**
     * Send system message (used by other services)
     * @param {string} treatmentPlanId - Treatment plan ID
     * @param {string} content - Message content
     * @param {string} messageType - Message type (ALERT, MILESTONE, SYSTEM)
     */
  async sendSystemMessage(treatmentPlanId, content, messageType = 'SYSTEM') {
    const conversation = await ConversationRepository.findByTreatmentPlan(treatmentPlanId);

    if (!conversation) {
      console.log('[ChatService] No conversation found for plan:', treatmentPlanId);
      return;
    }

    const message = await MessageRepository.create({
      conversationId: conversation._id,
      type: messageType,
      content,
    });

    await ConversationRepository.updateLastMessage(conversation._id, message);
  }
}

// Export singleton instance
const chatServiceInstance = new ChatService();

// Export the sendSystemMessage function for backward compatibility
module.exports = chatServiceInstance;
module.exports.sendSystemMessage = chatServiceInstance.sendSystemMessage.bind(chatServiceInstance);
