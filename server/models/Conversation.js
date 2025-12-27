const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }],
  treatmentPlanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TreatmentPlan',
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastMessageAt: {
    type: Date,
    default: Date.now,
  },
  lastMessageContent: {
    type: String, // Preview text
  },
  lastMessageSender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  lastMessageType: {
    type: String,
    default: 'USER',
  },
  readStatus: {
    type: Map,
    of: Date,
    default: {},
  },
  closedAt: {
    type: Date,
  },
  closedReason: {
    type: String,
  },
}, {timestamps: true});

// Ensure unique conversation per treatment plan
ConversationSchema.index({treatmentPlanId: 1}, {unique: true});

module.exports = mongoose.model('Conversation', ConversationSchema);
