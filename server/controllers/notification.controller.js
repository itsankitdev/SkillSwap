const { Notification } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/sendResponse');

// ── GET /api/notifications ───────────────────────────────
exports.getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find({ recipient: req.user._id })
      .populate('sender', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Notification.countDocuments({ recipient: req.user._id }),
    Notification.countDocuments({ recipient: req.user._id, isRead: false }),
  ]);

  sendResponse(res, 200, 'Notifications fetched', {
    notifications,
    unreadCount,
    pagination: {
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    },
  });
});

// ── PUT /api/notifications/:id/read ─────────────────────
exports.markAsRead = asyncHandler(async (req, res) => {
  await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { isRead: true }
  );
  sendResponse(res, 200, 'Marked as read', null);
});

// ── PUT /api/notifications/read-all ─────────────────────
exports.markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { isRead: true }
  );
  sendResponse(res, 200, 'All marked as read', null);
});

// ── DELETE /api/notifications/:id ───────────────────────
exports.deleteNotification = asyncHandler(async (req, res) => {
  await Notification.findOneAndDelete({
    _id: req.params.id,
    recipient: req.user._id,
  });
  sendResponse(res, 200, 'Notification deleted', null);
});

// ── DELETE /api/notifications/clear-all ─────────────────
exports.clearAll = asyncHandler(async (req, res) => {
  await Notification.deleteMany({ recipient: req.user._id });
  sendResponse(res, 200, 'All notifications cleared', null);
});