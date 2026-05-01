const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema(
  {
    // Who gave the rating
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Who received the rating
    reviewee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Which session this rating is for
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      required: true,
    },
    // Which swap request context
    swapRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SwapRequest',
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Minimum rating is 1'],
      max: [5, 'Maximum rating is 5'],
    },
    review: {
      type: String,
      maxlength: [500, 'Review cannot exceed 500 characters'],
      default: '',
      trim: true,
    },
    // What skill context was this rating for
    skillContext: {
      type: String,
      maxlength: 100,
      default: '',
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// One rating per reviewer per session — no duplicates
ratingSchema.index({ reviewer: 1, session: 1 }, { unique: true });
ratingSchema.index({ reviewee: 1, createdAt: -1 });

module.exports = mongoose.model('Rating', ratingSchema);