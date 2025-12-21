const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

const sendSystemMessage = async (treatmentPlanId, content, type = 'SYSTEM', metaData = {}) => {
    try {
        let conversation = await Conversation.findOne({ treatmentPlanId });

        if (!conversation) {
            console.log('[ChatService] No conversation found for plan:', treatmentPlanId);
            return;
        }

        await Message.create({
            conversationId: conversation._id,
            sender: null, // System message has no sender
            type,
            content,
            metaData
        });

        // Update last message time and content
        conversation.lastMessageAt = new Date();
        conversation.lastMessageContent = content; // Preview system message
        conversation.lastMessageSender = null; // No sender
        conversation.lastMessageType = type;
        await conversation.save();

        console.log(`[ChatService] System message sent: [${type}] ${content}`);
    } catch (error) {
        console.error('[ChatService] Error sending system message:', error);
    }
};

module.exports = { sendSystemMessage };
