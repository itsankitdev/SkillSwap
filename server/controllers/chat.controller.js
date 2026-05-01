const { Conversation, Message } = require('../models');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/sendResponse');
const { createNotification } = require('../utils/notificationService');



// ── GET /api/chat — get all my conversations ─────────────
exports.getMyConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({
    participants: req.user._id,
    isActive: true,
  })
    .populate('participants', 'name avatar')
    .populate('swapRequest', 'status offeredSkill wantedSkill')
    .populate({
      path: 'swapRequest',
      populate: [
        { path: 'offeredSkill', select: 'title' },
        { path: 'wantedSkill', select: 'title' },
      ],
    })
    .sort({ updatedAt: -1 });

  sendResponse(res, 200, 'Conversations fetched', { conversations });
});

// ── GET /api/chat/:conversationId — get messages ─────────
exports.getMessages = asyncHandler(async (req, res, next) => {
  const { conversationId } = req.params;
  const { page = 1, limit = 50 } = req.query;

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) return next(new AppError('Conversation not found', 404));

  // Only participants can read messages
  const isParticipant = conversation.participants
    .some(p => p.toString() === req.user._id.toString());
  if (!isParticipant) return next(new AppError('Not authorized', 403));

  const skip = (Number(page) - 1) * Number(limit);

  const messages = await Message.find({ conversation: conversationId })
    .populate('sender', 'name avatar')
    .sort({ createdAt: 1 })
    .skip(skip)
    .limit(Number(limit));

  // Mark all as seen
  await Message.updateMany(
    {
      conversation: conversationId,
      seenBy: { $ne: req.user._id },
    },
    { $addToSet: { seenBy: req.user._id } }
  );

  sendResponse(res, 200, 'Messages fetched', { messages });
});

// ── POST /api/chat/:conversationId — send message ────────
// ── POST /api/chat/:conversationId — send message ────────
exports.sendMessage = asyncHandler(async (req, res, next) => {
  const { conversationId } = req.params;
  const { text, type = 'text' } = req.body;

  if (!text?.trim()) return next(new AppError('Message cannot be empty', 400));

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) return next(new AppError('Conversation not found', 404));

  const isParticipant = conversation.participants
    .some(p => p.toString() === req.user._id.toString());
  if (!isParticipant) return next(new AppError('Not authorized', 403));

  const message = await Message.create({
    conversation: conversationId,
    sender: req.user._id,
    text: text.trim(),
    type,
    seenBy: [req.user._id],
  });

  // Update last message on conversation
  conversation.lastMessage = {
    text: text.trim(),
    sender: req.user._id,
    seenBy: [req.user._id],
    createdAt: new Date(),
  };
  await conversation.save();

  // --- ADDED NOTIFICATION LOGIC START ---
  const io = req.app.get('io');
  const otherParticipants = conversation.participants
    .filter(p => p.toString() !== req.user._id.toString());

  for (const participantId of otherParticipants) {
    await createNotification({
      recipientId: participantId,
      senderId: req.user._id,
      senderName: req.user.name,
      type: 'new_message',
      link: `/chat/${conversation._id}`,
      relatedId: conversation._id,
      extraData: {},
      io,
    });
  }
  // --- ADDED NOTIFICATION LOGIC END ---

  const populated = await message.populate('sender', 'name avatar');

  sendResponse(res, 201, 'Message sent', { message: populated });
});
