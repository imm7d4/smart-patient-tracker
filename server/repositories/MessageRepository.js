const Message = require('../models/Message');

class MessageRepository {
  /**
     * Create message
     * @param {Object} messageData - Message data
     * @returns {Promise<Object>} Created message
     */
  async create(messageData) {
    return await Message.create(messageData);
  }

  /**
     * Find messages by conversation
     * @param {string} conversationId - Conversation ID
     * @param {Object} filters - Additional filters
     * @param {number} limit - Limit number of messages
     * @returns {Promise<Array>} Array of messages
     */
  async findByConversation(conversationId, filters = {}, limit = 50) {
    const query = {conversationId, ...filters};
    return await Message.find(query)
        .sort({createdAt: 1, _id: 1})
        .limit(limit);
  }

  /**
     * Find messages since timestamp
     * @param {string} conversationId - Conversation ID
     * @param {Date} timestamp - Timestamp to search from
     * @param {number} limit - Limit number of messages
     * @returns {Promise<Array>} Array of messages
     */
  async findSince(conversationId, timestamp, limit = 50) {
    return await Message.find({
      conversationId,
      createdAt: {$gt: timestamp},
    })
        .sort({createdAt: 1, _id: 1})
        .limit(limit);
  }
}

module.exports = new MessageRepository();
