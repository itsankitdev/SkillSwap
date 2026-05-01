const { Session, Conversation, Message } = require("../models");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const sendResponse = require("../utils/sendResponse");
const { createNotification } = require("../utils/notificationService");

// ── POST /api/sessions — propose a session ───────────────
exports.proposeSession = asyncHandler(async (req, res, next) => {
  const {
    conversationId,
    title,
    scheduledAt,
    duration,
    meetingLink,
    notes,
    skillBeingTaught,
  } = req.body;

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) return next(new AppError("Conversation not found", 404));

  // Must be a participant
  const isParticipant = conversation.participants.some(
    (p) => p.toString() === req.user._id.toString(),
  );
  if (!isParticipant) return next(new AppError("Not authorized", 403));

  // Validate date is in future
  if (new Date(scheduledAt) <= new Date()) {
    return next(new AppError("Session must be scheduled in the future", 400));
  }

  const session = await Session.create({
    conversation: conversationId,
    swapRequest: conversation.swapRequest,
    proposedBy: req.user._id,
    participants: conversation.participants,
    title,
    scheduledAt,
    duration: duration || 60,
    meetingLink: meetingLink || "",
    notes: notes || "",
    skillBeingTaught: skillBeingTaught || null,
    status: "proposed",
  });

  // Post system message in chat about the proposed session
  const formattedDate = new Date(scheduledAt).toLocaleString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  await Message.create({
    conversation: conversationId,
    sender: req.user._id,
    text: `📅 Session proposed: "${title}" on ${formattedDate} for ${duration || 60} mins`,
    type: "system",
    metadata: { sessionId: session._id, type: "session_proposed" },
    seenBy: [req.user._id],
  });

  const populated = await Session.findById(session._id)
    .populate("proposedBy", "name avatar")
    .populate("participants", "name avatar")
    .populate("skillBeingTaught", "title");

  sendResponse(res, 201, "Session proposed successfully", {
    session: populated,
  });

  const io = req.app.get("io");
  const otherParticipants = conversation.participants.filter(
    (p) => p.toString() !== req.user._id.toString(),
  );

  for (const participantId of otherParticipants) {
    await createNotification({
      recipientId: participantId,
      senderId: req.user._id,
      senderName: req.user.name,
      type: "session_proposed",
      link: `/chat/${conversationId}`,
      relatedId: session._id,
      extraData: { sessionTitle: title },
      io,
    });
  }
});

// ── GET /api/sessions — get my upcoming sessions ─────────
exports.getMySessions = asyncHandler(async (req, res) => {
  const { status } = req.query;

  const filter = {
    participants: req.user._id,
  };
  if (status) filter.status = status;

  const sessions = await Session.find(filter)
    .populate("proposedBy", "name avatar")
    .populate("participants", "name avatar")
    .populate("skillBeingTaught", "title category")
    .populate("conversation", "swapRequest")
    .sort({ scheduledAt: 1 });

  sendResponse(res, 200, "Sessions fetched", { sessions });
});

// ── GET /api/sessions/:id — single session ───────────────
exports.getSession = asyncHandler(async (req, res, next) => {
  const session = await Session.findById(req.params.id)
    .populate("proposedBy", "name avatar")
    .populate("participants", "name avatar")
    .populate("skillBeingTaught", "title category");

  if (!session) return next(new AppError("Session not found", 404));

  const isParticipant = session.participants.some(
    (p) => p._id.toString() === req.user._id.toString(),
  );
  if (!isParticipant) return next(new AppError("Not authorized", 403));

  sendResponse(res, 200, "Session fetched", { session });
});

// ── PUT /api/sessions/:id — confirm/reject/complete ──────
exports.updateSession = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  const session = await Session.findById(req.params.id);

  if (!session) return next(new AppError("Session not found", 404));

  const isParticipant = session.participants.some(
    (p) => p.toString() === req.user._id.toString(),
  );
  if (!isParticipant) return next(new AppError("Not authorized", 403));

  const isProposer = session.proposedBy.toString() === req.user._id.toString();

  // Only non-proposer can confirm/reject
  if ((status === "confirmed" || status === "rejected") && isProposer) {
    return next(
      new AppError("You cannot confirm your own session proposal", 403),
    );
  }

  // Only proposer can cancel
  if (status === "cancelled" && !isProposer) {
    return next(new AppError("Only the proposer can cancel", 403));
  }

  session.status = status;
  await session.save();

  // Post system message about status change
  const statusMessages = {
    confirmed: "✅ Session confirmed! See you there.",
    rejected: "❌ Session proposal was declined.",
    cancelled: "🚫 Session was cancelled.",
    completed: "🏆 Session marked as completed!",
  };

  await Message.create({
    conversation: session.conversation,
    sender: req.user._id,
    text: statusMessages[status] || `Session ${status}`,
    type: "system",
    metadata: { sessionId: session._id, type: `session_${status}` },
    seenBy: [req.user._id],
  });

  const populated = await Session.findById(session._id)
    .populate("proposedBy", "name avatar")
    .populate("participants", "name avatar")
    .populate("skillBeingTaught", "title");

  sendResponse(res, 200, `Session ${status}`, { session: populated });

  const io = req.app.get('io');

  if (status === 'confirmed' || status === 'rejected') {
    await createNotification({
      recipientId: session.proposedBy,
      senderId: req.user._id,
      senderName: req.user.name,
      type: status === 'confirmed' ? 'session_confirmed' : 'session_rejected',
      link: '/sessions',
      relatedId: session._id,
      extraData: { sessionTitle: session.title },
      io,
    });
  }
});

// ── DELETE /api/sessions/:id ─────────────────────────────
exports.deleteSession = asyncHandler(async (req, res, next) => {
  const session = await Session.findById(req.params.id);
  if (!session) return next(new AppError("Session not found", 404));

  const isProposer = session.proposedBy.toString() === req.user._id.toString();
  if (!isProposer) return next(new AppError("Only proposer can delete", 403));

  await session.deleteOne();
  sendResponse(res, 200, "Session deleted", null);
});
