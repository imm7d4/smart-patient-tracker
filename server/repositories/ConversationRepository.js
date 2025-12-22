const Conversation = require('../models/Conversation');

class ConversationRepository {
    /**
     * Create conversation
     * @param {Object} conversationData - Conversation data
     * @returns {Promise<Object>} Created conversation
     */
    async create(conversationData) {
        return await Conversation.create(conversationData);
    }

    /**
     * Find conversation by treatment plan
     * @param {string} treatmentPlanId - Treatment plan ID
     * @returns {Promise<Object|null>} Conversation or null
     */
    async findByTreatmentPlan(treatmentPlanId) {
        return await Conversation.findOne({ treatmentPlanId });
    }

    /**
     * Find conversations for user
     * @param {string} userId - User ID
     * @param {Object} filters - Additional filters
     * @returns {Promise<Array>} Array of conversations
     */
    async findByParticipant(userId, filters = {}) {
        const query = {
            participants: userId,
            ...filters
        };
        return await Conversation.find(query)
            .populate('participants', 'name email role')
            .sort({ lastMessageAt: -1 });
    }

    /**
     * Update last message info
     * @param {string} id - Conversation ID
     * @param {Object} messageData - Message data
     * @returns {Promise<Object|null>} Updated conversation
     */
    async updateLastMessage(id, messageData) {
        return await Conversation.findByIdAndUpdate(id, {
            lastMessageAt: messageData.createdAt,
            lastMessageContent: messageData.content,
            lastMessageSender: messageData.sender,
            lastMessageType: messageData.type
        }, { new: true });
    }

    /**
     * Update read status for user
     * @param {string} id - Conversation ID
     * @param {string} userId - User ID
     * @param {Date} timestamp - Read timestamp
     * @returns {Promise<Object|null>} Updated conversation
     */
    async updateReadStatus(id, userId, timestamp) {
        const updateKey = `readStatus.${userId}`;
        return await Conversation.findByIdAndUpdate(id, {
            $set: { [updateKey]: timestamp }
        }, { new: true });
    }

    /**
     * Find conversation by ID
     * @param {string} id - Conversation ID
     * @returns {Promise<Object|null>} Conversation or null
     */
    async findById(id) {
        return await Conversation.findById(id);
    }
}

module.exports = new ConversationRepository();
