const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { chatGuard } = require('../middleware/chatMiddleware');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// Apply protection globally to chat routes
router.use(protect);

/**
 * @route   POST /api/chat/conversations/init
 * @desc    Initialize or retrieve an existing conversation with a target user
 * @access  Private (Patient/Doctor)
 */
router.post('/conversations/init', chatGuard, async (req, res) => {
    try {
        const { targetUserId } = req.body;
        const treatmentPlan = req.treatmentPlan; // Attached by chatGuard

        // Check if conversation already exists for this plan
        let conversation = await Conversation.findOne({ treatmentPlanId: treatmentPlan._id });

        if (!conversation) {
            console.log('Creating new conversation for plan:', treatmentPlan._id);
            conversation = await Conversation.create({
                participants: [req.user.id, targetUserId],
                treatmentPlanId: treatmentPlan._id,
                isActive: true
            });

            // Send initial System Message
            await Message.create({
                conversationId: conversation._id,
                type: 'SYSTEM',
                content: 'Secure chat initialized for this treatment plan.'
            });
        } else {
            console.log('Existing conversation found:', conversation._id);
        }

        res.json({ success: true, data: conversation });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @route   GET /api/chat/conversations
 * @desc    Get all active conversations for the current user
 * @access  Private
 */
router.get('/conversations', chatGuard, async (req, res) => {
    try {
        console.log('GET /conversations for user:', req.user.id);
        const conversations = await Conversation.find({
            participants: req.user.id,
            isActive: true
        })
            .populate('participants', 'name email role')
            .sort({ lastMessageAt: -1 });

        console.log('Conversations found:', conversations.length);

        // Add unread count logic if needed here, 
        // but for now relying on readStatus map in Conversation is efficient enough for the list

        res.json({ success: true, data: conversations });
    } catch (error) {
        console.error('GET /conversations error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @route   GET /api/chat/messages
 * @desc    Get messages for a conversation
 * @access  Private
 */
router.get('/messages', chatGuard, async (req, res) => {
    try {
        console.log('GET /messages params:', req.query);
        const { conversationId, since, limit = 50 } = req.query;

        if (!conversationId) {
            return res.status(400).json({ success: false, message: 'Conversation ID required' });
        }

        let query = { conversationId };

        // Smart Polling optimization
        if (since && since !== 'null' && since !== 'undefined') {
            const dateSince = new Date(since);
            if (!isNaN(dateSince.getTime())) {
                query.createdAt = { $gt: dateSince };
            }
        }

        console.log('Message Query:', query);

        const messages = await Message.find(query)
            .sort({ createdAt: 1, _id: 1 }) // Oldest to newest, stable sort
            .limit(parseInt(limit));

        console.log('Messages Found:', messages.length);

        res.json({ success: true, data: messages });
    } catch (error) {
        console.error('GET /messages error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @route   POST /api/chat/messages
 * @desc    Send a message
 * @access  Private
 */
router.post('/messages', chatGuard, async (req, res) => {
    try {
        const { conversationId, content } = req.body;

        // Create Message
        const message = await Message.create({
            conversationId,
            sender: req.user.id,
            content,
            type: 'USER'
        });

        // Update Conversation
        await Conversation.findByIdAndUpdate(conversationId, {
            lastMessageAt: message.createdAt,
            lastMessageContent: content,
            lastMessageSender: req.user.id,
            lastMessageType: 'USER'
        });

        res.json({ success: true, data: message });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @route   PATCH /api/chat/conversations/read
 * @desc    Mark conversation as read up to a specific timestamp
 * @access  Private
 */
router.patch('/conversations/read', chatGuard, async (req, res) => {
    try {
        const { conversationId, timestamp } = req.body;

        if (!conversationId) {
            return res.status(400).json({ success: false, message: 'Conversation ID required' });
        }

        // Update the specific user's read timestamp in the map
        const updateKey = `readStatus.${req.user.id}`;

        await Conversation.findByIdAndUpdate(conversationId, {
            $set: { [updateKey]: new Date(timestamp || Date.now()) }
        });

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @route   GET /api/chat/contacts
 * @desc    Get available contacts (users with active treatment plans)
 * @access  Private
 */
router.get('/contacts', chatGuard, async (req, res) => {
    try {
        const TreatmentPlan = require('../models/TreatmentPlan');
        const userId = req.user.id;
        const role = req.user.role;

        let query = { status: 'ACTIVE' };
        if (role === 'PATIENT') {
            query.patientId = userId;
        } else if (role === 'DOCTOR') {
            query.doctorId = userId;
        }

        console.log('Fetching contacts for:', { userId, role, query });

        const plans = await TreatmentPlan.find(query)
            .populate('patientId', 'name email role')
            .populate('doctorId', 'name email role');

        console.log('Plans found:', plans.length);

        // Extract unique contacts
        const contactsMap = new Map();

        plans.forEach(plan => {
            const contact = role === 'PATIENT' ? plan.doctorId : plan.patientId;
            if (contact && !contactsMap.has(contact._id.toString())) {
                contactsMap.set(contact._id.toString(), contact);
            }
        });

        res.json({ success: true, data: Array.from(contactsMap.values()) });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
