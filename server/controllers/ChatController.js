const ChatService = require('../services/chatService');

class ChatController {
  /**
     * Initialize conversation
     * POST /api/chat/conversations/init
     */
  async initConversation(req, res) {
    try {
      const {targetUserId} = req.body;
      const treatmentPlan = req.treatmentPlan; // Attached by chatGuard

      // Basic shape validation
      if (!targetUserId) {
        return res.status(400).json({
          success: false,
          message: 'Target user ID required',
        });
      }

      const conversation = await ChatService.initConversation(
          req.user.id,
          targetUserId,
          treatmentPlan._id,
      );

      res.json({success: true, data: conversation});
    } catch (error) {
      res.status(500).json({success: false, message: error.message});
    }
  }

  /**
     * Get conversations
     * GET /api/chat/conversations
     */
  async getConversations(req, res) {
    try {
      const conversations = await ChatService.getConversations(req.user.id);
      res.json({success: true, data: conversations});
    } catch (error) {
      res.status(500).json({success: false, message: error.message});
    }
  }

  /**
     * Get messages
     * GET /api/chat/messages
     */
  async getMessages(req, res) {
    try {
      const {conversationId, since, limit = 50} = req.query;

      // Basic shape validation
      if (!conversationId) {
        return res.status(400).json({success: false, message: 'Conversation ID required'});
      }

      const messages = await ChatService.getMessages(conversationId, since, parseInt(limit));
      res.json({success: true, data: messages});
    } catch (error) {
      res.status(500).json({success: false, message: error.message});
    }
  }

  /**
     * Send message
     * POST /api/chat/messages
     */
  async sendMessage(req, res) {
    try {
      const {conversationId, content} = req.body;

      // Basic shape validation
      if (!conversationId || !content) {
        return res.status(400).json({
          success: false,
          message: 'Conversation ID and content required',
        });
      }

      const message = await ChatService.sendMessage(conversationId, req.user.id, content);
      res.json({success: true, data: message});
    } catch (error) {
      res.status(500).json({success: false, message: error.message});
    }
  }

  /**
     * Mark as read
     * PATCH /api/chat/conversations/read
     */
  async markAsRead(req, res) {
    try {
      const {conversationId, timestamp} = req.body;

      // Basic shape validation
      if (!conversationId) {
        return res.status(400).json({success: false, message: 'Conversation ID required'});
      }

      await ChatService.markAsRead(conversationId, req.user.id, timestamp);
      res.json({success: true});
    } catch (error) {
      res.status(500).json({success: false, message: error.message});
    }
  }

  /**
     * Get contacts
     * GET /api/chat/contacts
     */
  async getContacts(req, res) {
    try {
      const contacts = await ChatService.getContacts(req.user.id, req.user.role);
      res.json({success: true, data: contacts});
    } catch (error) {
      res.status(500).json({success: false, message: error.message});
    }
  }
}

module.exports = new ChatController();
