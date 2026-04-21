const jwt = require('jsonwebtoken');
const { User } = require('../models');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

exports.protect = asyncHandler(async (req, res, next) => {
  // 1. Extract token from Authorization header
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in. Please log in to continue.', 401));
  }

  // 2. Verify token signature and expiry
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Your session has expired. Please log in again.', 401));
    }
    return next(new AppError('Invalid token. Please log in again.', 401));
  }

  // 3. Check user still exists (could be deleted after token issued)
  const user = await User.findById(decoded.id);
  if (!user) {
    return next(new AppError('User no longer exists.', 401));
  }

  // 4. Check if user is active
  if (!user.isActive) {
    return next(new AppError('Your account has been deactivated.', 403));
  }

  // 5. Check if password changed after token was issued
  if (user.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('Password was recently changed. Please log in again.', 401));
  }

  // 6. Attach user to request — available in all downstream controllers
  req.user = user;
  next();
});

exports.adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  return next(new AppError('You do not have permission to perform this action.', 403));
};

// Optional auth — attaches user if token present, doesn't block if missing
exports.optionalAuth = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) return next(); // No token — just continue as guest

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (user && user.isActive) req.user = user; // Attach if valid
  } catch {
    // Invalid token — just continue as guest, don't block
  }

  next();
});