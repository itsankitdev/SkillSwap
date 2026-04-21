const mongoose = require('mongoose');

const swapRequestSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Skill the sender is offering to teach
    offeredSkill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill',
      required: true,
    },
    // Skill the sender wants to learn from receiver
    wantedSkill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill',
      required: true,
    },
    // Sender's own learn-type skill — stored at request creation for reliable completion
    senderLearnSkill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill',
      default: null,
    },
    message: {
      type: String,
      maxlength: [300, 'Message cannot exceed 300 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
      default: 'pending',
    },
    creditAmount: {
      type: Number,
      required: true,
      min: 1,
    },
    // Timestamps for each status change — useful for analytics + disputes
    statusHistory: [
      {
        status: String,
        changedAt: { type: Date, default: Date.now },
        note: String,
      },
    ],
    // Set when both parties confirm completion
    completedAt: Date,
  },
  {
    timestamps: true,
  }
);

// ── Indexes ──────────────────────────────────────────────
swapRequestSchema.index({ sender: 1, status: 1 });
swapRequestSchema.index({ receiver: 1, status: 1 });
swapRequestSchema.index(
  { sender: 1, receiver: 1, offeredSkill: 1, wantedSkill: 1, status: 1 },
  { unique: false }
);

// ── Pre-save: Push to statusHistory on status change ────
swapRequestSchema.pre('save', async function () {
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      changedAt: new Date(),
    });
  }
});

module.exports = mongoose.model('SwapRequest', swapRequestSchema);