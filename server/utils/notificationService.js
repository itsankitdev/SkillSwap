const { Notification } = require('../models');

// Notification templates
const TEMPLATES = {
  swap_request: (senderName, skillTitle) => ({
    title: 'New Swap Request',
    message: `${senderName} wants to swap skills for "${skillTitle}"`,
  }),
  request_accepted: (senderName, skillTitle) => ({
    title: 'Request Accepted! 🎉',
    message: `${senderName} accepted your swap request for "${skillTitle}"`,
  }),
  request_rejected: (senderName, skillTitle) => ({
    title: 'Request Declined',
    message: `${senderName} declined your swap request for "${skillTitle}"`,
  }),
  request_completed: (senderName) => ({
    title: 'Swap Completed! 🏆',
    message: `${senderName} marked your swap as completed`,
  }),
  new_message: (senderName) => ({
    title: 'New Message',
    message: `${senderName} sent you a message`,
  }),
  session_proposed: (senderName, sessionTitle) => ({
    title: 'Session Proposed 📅',
    message: `${senderName} proposed a session: "${sessionTitle}"`,
  }),
  session_confirmed: (senderName, sessionTitle) => ({
    title: 'Session Confirmed ✅',
    message: `${senderName} confirmed "${sessionTitle}"`,
  }),
  session_rejected: (senderName, sessionTitle) => ({
    title: 'Session Declined',
    message: `${senderName} declined "${sessionTitle}"`,
  }),
  new_rating: (senderName, stars) => ({
    title: 'New Rating ⭐',
    message: `${senderName} gave you ${stars} star${stars !== 1 ? 's' : ''}`,
  }),
};

const createNotification = async ({
  recipientId,
  senderId,
  senderName,
  type,
  link,
  relatedId,
  extraData = {},
  io, // socket.io instance
}) => {
  try {
    const template = TEMPLATES[type];
    if (!template) throw new Error(`Unknown notification type: ${type}`);

    // Build title and message from template
    let notifData;
    if (type === 'swap_request') {
      notifData = template(senderName, extraData.skillTitle);
    } else if (type === 'request_accepted') {
      notifData = template(senderName, extraData.skillTitle);
    } else if (type === 'request_rejected') {
      notifData = template(senderName, extraData.skillTitle);
    } else if (type === 'request_completed') {
      notifData = template(senderName);
    } else if (type === 'new_message') {
      notifData = template(senderName);
    } else if (type === 'session_proposed') {
      notifData = template(senderName, extraData.sessionTitle);
    } else if (type === 'session_confirmed') {
      notifData = template(senderName, extraData.sessionTitle);
    } else if (type === 'session_rejected') {
      notifData = template(senderName, extraData.sessionTitle);
    } else if (type === 'new_rating') {
      notifData = template(senderName, extraData.stars);
    }

    const notification = await Notification.create({
      recipient: recipientId,
      sender: senderId,
      type,
      title: notifData.title,
      message: notifData.message,
      link: link || '/',
      relatedId: relatedId || null,
    });

    // Emit real-time notification via socket if io provided
    if (io) {
      io.to(`user_${recipientId}`).emit('new_notification', {
        ...notification.toObject(),
        sender: { _id: senderId, name: senderName },
      });
    }

    return notification;
  } catch (err) {
    console.error('❌ Notification error:', err.message);
  }
};

module.exports = { createNotification };