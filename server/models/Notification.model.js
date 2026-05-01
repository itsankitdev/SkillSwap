const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'swap_request',      // someone sent you a swap request
        'request_accepted',  // your request was accepted
        'request_rejected',  // your request was rejected
        'request_completed', // swap marked complete
        'new_message',       // new chat message
        'session_proposed',  // session proposed
        'session_confirmed', // session confirmed
        'session_rejected',  // session rejected
        'new_rating',        // someone rated you
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    // Link to navigate to when clicked
    link: {
      type: String,
      default: '/',
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    // Reference to related document
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);