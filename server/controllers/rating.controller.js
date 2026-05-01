const { Rating, User, Session } = require('../models');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/sendResponse');
const { createNotification } = require('../utils/notificationService');

// ── POST /api/ratings — submit a rating ──────────────────
exports.submitRating = asyncHandler(async (req, res, next) => {
  const { sessionId, revieweeId, rating, review, skillContext } = req.body;

  if (!sessionId || !revieweeId || !rating) {
    return next(new AppError('Session, reviewee and rating are required', 400));
  }

  // Validate session exists and is completed
  const session = await Session.findById(sessionId);
  if (!session) return next(new AppError('Session not found', 404));
  if (session.status !== 'completed') {
    return next(new AppError('You can only rate after a session is completed', 400));
  }

  // Must be a participant
  const isParticipant = session.participants
    .some(p => p.toString() === req.user._id.toString());
  if (!isParticipant) return next(new AppError('Not authorized', 403));

  // Can't rate yourself
  if (revieweeId === req.user._id.toString()) {
    return next(new AppError('You cannot rate yourself', 400));
  }

  // Check if already rated this session
  const existing = await Rating.findOne({
    reviewer: req.user._id,
    session: sessionId,
  });
  if (existing) {
    return next(new AppError('You have already rated this session', 400));
  }

  // Create rating
  const newRating = await Rating.create({
    reviewer: req.user._id,
    reviewee: revieweeId,
    session: sessionId,
    swapRequest: session.swapRequest,
    rating: Number(rating),
    review: review || '',
    skillContext: skillContext || '',
  });

  // Update reviewee's rating summary
  const allRatings = await Rating.find({ reviewee: revieweeId });
  const total = allRatings.reduce((sum, r) => sum + r.rating, 0);
  const average = total / allRatings.length;

  await User.findByIdAndUpdate(revieweeId, {
    'ratings.average': Math.round(average * 10) / 10, // round to 1 decimal
    'ratings.count': allRatings.length,
    'ratings.total': total,
  });

  const populated = await Rating.findById(newRating._id)
    .populate('reviewer', 'name avatar')
    .populate('reviewee', 'name avatar');

  sendResponse(res, 201, 'Rating submitted successfully', { rating: populated });

  const io = req.app.get('io');
await createNotification({
  recipientId: revieweeId,
  senderId: req.user._id,
  senderName: req.user.name,
  type: 'new_rating',
  link: '/profile',
  relatedId: newRating._id,
  extraData: { stars: Number(rating) },
  io,
});
});

// ── GET /api/ratings/user/:userId — get user's reviews ───
exports.getUserRatings = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const [ratings, total] = await Promise.all([
    Rating.find({ reviewee: userId, isPublic: true })
      .populate('reviewer', 'name avatar')
      .populate('session', 'title scheduledAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Rating.countDocuments({ reviewee: userId, isPublic: true }),
  ]);

  // Get summary
  const user = await User.findById(userId).select('ratings name');

  sendResponse(res, 200, 'Ratings fetched', {
    ratings,
    summary: user?.ratings || { average: 0, count: 0 },
    pagination: {
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    },
  });
});

// ── GET /api/ratings/session/:sessionId — check if rated ─
exports.getSessionRatingStatus = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  const myRating = await Rating.findOne({
    reviewer: req.user._id,
    session: sessionId,
  });

  sendResponse(res, 200, 'Rating status fetched', {
    hasRated: !!myRating,
    rating: myRating || null,
  });
});