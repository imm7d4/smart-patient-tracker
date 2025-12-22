const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { chatGuard } = require('../middleware/chatMiddleware');
const ChatController = require('../controllers/ChatController');

// Apply protection globally to chat routes
router.use(protect);

/**
 * @route   POST /api/chat/conversations/init
 * @desc    Initialize or retrieve an existing conversation with a target user
 * @access  Private (Patient/Doctor)
 */
router.post('/conversations/init', chatGuard, ChatController.initConversation.bind(ChatController));

/**
 * @route   GET /api/chat/conversations
 * @desc    Get all active conversations for the current user
 * @access  Private
 */
router.get('/conversations', chatGuard, ChatController.getConversations.bind(ChatController));

/**
 * @route   GET /api/chat/messages
 * @desc    Get messages for a conversation
 * @access  Private
 */
router.get('/messages', chatGuard, ChatController.getMessages.bind(ChatController));

/**
 * @route   POST /api/chat/messages
 * @desc    Send a message
 * @access  Private
 */
router.post('/messages', chatGuard, ChatController.sendMessage.bind(ChatController));

/**
 * @route   PATCH /api/chat/conversations/read
 * @desc    Mark conversation as read up to a specific timestamp
 * @access  Private
 */
router.patch('/conversations/read', chatGuard, ChatController.markAsRead.bind(ChatController));

/**
 * @route   GET /api/chat/contacts
 * @desc    Get available contacts (users with active treatment plans)
 * @access  Private
 */
router.get('/contacts', chatGuard, ChatController.getContacts.bind(ChatController));

module.exports = router;
