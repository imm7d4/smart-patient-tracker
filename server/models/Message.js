const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true,
        index: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null // Null for SYSTEM messages
    },
    content: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['USER', 'SYSTEM', 'ALERT', 'MILESTONE'],
        default: 'USER'
    },
    metaData: {
        type: Object // Flexible structure for links, headers, etc.
    },
    flagged: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);
