const { CreditTransaction, User } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/sendResponse');

// ── GET /api/credits/balance ─────────────────────────────
exports.getBalance = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('credits');
  sendResponse(res, 200, 'Balance fetched successfully', {
    credits: user.credits,
  });
});

// ── GET /api/credits/history ─────────────────────────────
exports.getHistory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const [transactions, total] = await Promise.all([
    CreditTransaction.find({ user: req.user._id })
      .populate('relatedUser', 'name avatar')
      .populate('relatedRequest', 'status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    CreditTransaction.countDocuments({ user: req.user._id }),
  ]);

  sendResponse(res, 200, 'Credit history fetched successfully', {
    transactions,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  });
});