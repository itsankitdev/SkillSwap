const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    // Linked to the swap request that created it
    swapRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SwapRequest',
      required: true,
      unique: true, // one conversation per swap
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    // Quick reference to last message for conversation list
    lastMessage: {
      text: { type: String, default: '' },
      sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      seenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      createdAt: { type: Date, default: Date.now },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

conversationSchema.index({ participants: 1 });
// conversationSchema.index({ swapRequest: 1 });

module.exports = mongoose.model('Conversation', conversationSchema);