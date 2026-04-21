const { User, Skill } = require('../models');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/sendResponse');

// ── GET /api/users/:id ───────────────────────────────────
exports.getUserById = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user || !user.isActive) {
    return next(new AppError('User not found', 404));
  }

  // Also fetch their public skills
  const skills = await Skill.find({ user: user._id, isActive: true });

  sendResponse(res, 200, 'User fetched successfully', { user, skills });
});

// ── PUT /api/users/:id ───────────────────────────────────
exports.updateUser = asyncHandler(async (req, res, next) => {
  // Only allow users to update their own profile
  if (req.params.id !== req.user._id.toString()) {
    return next(new AppError('You can only update your own profile', 403));
  }

  // Whitelist allowed fields — never let users update credits/role directly
  const allowed = ['name', 'bio', 'avatar', 'location'];
  const updates = {};
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const user = await User.findByIdAndUpdate(
    req.params.id,
    updates,
    {
      new: true,          // Return updated document
      runValidators: true // Run schema validators on update
    }
  ).select('-password');

  if (!user) return next(new AppError('User not found', 404));

  sendResponse(res, 200, 'Profile updated successfully', { user });
});

// ── DELETE /api/users/:id ────────────────────────────────
exports.deleteUser = asyncHandler(async (req, res, next) => {
  if (req.params.id !== req.user._id.toString()) {
    return next(new AppError('You can only delete your own account', 403));
  }

  // Soft delete — deactivate instead of removing
  await User.findByIdAndUpdate(req.params.id, { isActive: false });

  sendResponse(res, 200, 'Account deactivated successfully', null);
});