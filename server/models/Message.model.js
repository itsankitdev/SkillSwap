const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: [true, 'Message cannot be empty'],
      maxlength: [2000, 'Message too long'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['text', 'link', 'system'],
      default: 'text',
    },
    // For system messages like "Swap accepted" or "Session scheduled"
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    seenBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

messageSchema.index({ conversation: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);