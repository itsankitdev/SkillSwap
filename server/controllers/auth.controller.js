const { User } = require('../models');
const generateToken = require('../utils/generateToken');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/sendResponse');

// ── Helper: shape user data for response ─────────────────
const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  bio: user.bio,
  location: user.location,
  credits: user.credits,
  role: user.role,
  teachTags: user.teachTags,
  learnTags: user.learnTags,
  createdAt: user.createdAt,
});

// ── POST /api/auth/register ──────────────────────────────
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  // Check if email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('Email is already registered', 400));
  }

  // Create user — password hashing happens in pre-save hook (User model)
  const user = await User.create({ name, email, password });

  const token = generateToken(user._id);

  sendResponse(res, 201, 'Account created successfully', {
    token,
    user: sanitizeUser(user),
  });
});

// ── POST /api/auth/login ─────────────────────────────────
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Explicitly select password — it's hidden by default (select: false)
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    // Deliberately vague — don't reveal which field was wrong
    return next(new AppError('Invalid email or password', 401));
  }

  if (!user.isActive) {
    return next(new AppError('Your account has been deactivated', 403));
  }

  const token = generateToken(user._id);

  sendResponse(res, 200, 'Logged in successfully', {
    token,
    user: sanitizeUser(user),
  });
});

// ── GET /api/auth/me ─────────────────────────────────────
exports.getMe = asyncHandler(async (req, res) => {
  // req.user is attached by protect middleware
  const user = await User.findById(req.user._id);
  sendResponse(res, 200, 'User fetched successfully', {
    user: sanitizeUser(user),
  });
});