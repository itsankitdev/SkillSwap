const mongoose = require('mongoose');

const creditTransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['earn', 'spend', 'refund', 'bonus', 'penalty'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      // Positive = earned, Negative = spent
    },
    balanceAfter: {
      type: Number,
      required: true, // Snapshot of balance after this transaction
    },
    description: {
      type: String,
      required: true,
      maxlength: [200, 'Description too long'],
    },
    // Link to the swap that triggered this transaction
    relatedRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SwapRequest',
      default: null,
    },
    // Link to the other user involved (for display in history)
    relatedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
    // Immutable — never allow updates or deletes on this collection
  }
);

// ── Indexes ──────────────────────────────────────────────
creditTransactionSchema.index({ user: 1, createdAt: -1 }); // History sorted newest first
creditTransactionSchema.index({ relatedRequest: 1 });

// // ── Guard: Prevent any updates to transactions ───────────
// creditTransactionSchema.pre(['updateOne', 'findOneAndUpdate'], function () {
//   throw new Error('Credit transactions are immutable and cannot be modified');
// });

module.exports = mongoose.model('CreditTransaction', creditTransactionSchema);