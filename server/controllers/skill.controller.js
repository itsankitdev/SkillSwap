const mongoose = require('mongoose');
const { Skill, User } = require('../models');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/sendResponse');

// ── GET /api/skills ──────────────────────────────────────
exports.getAllSkills = asyncHandler(async (req, res) => {
  const {
    type, category, level, search,
    minCredits, maxCredits,
    page = 1, limit = 12,
    sortBy = 'createdAt', order = 'desc',
  } = req.query;

  const filter = { isActive: true };

  // Exclude current user's own skills if logged in
  if (req.user) {
    filter.user = { $ne: req.user._id };
  }

  if (type) filter.type = type;
  if (category) filter.category = category;
  if (level) filter.level = level;
  if (minCredits || maxCredits) {
    filter.creditCost = {};
    if (minCredits) filter.creditCost.$gte = Number(minCredits);
    if (maxCredits) filter.creditCost.$lte = Number(maxCredits);
  }
  // Full-text search across title, description, tags
  if (search) filter.$text = { $search: search };

  const skip = (Number(page) - 1) * Number(limit);
  const sortOrder = order === 'asc' ? 1 : -1;

  const [skills, total] = await Promise.all([
    Skill.find(filter)
      .populate('user', 'name avatar location credits')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(Number(limit)),
    Skill.countDocuments(filter),
  ]);

  sendResponse(res, 200, 'Skills fetched successfully', {
    skills,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  });
});

// ── GET /api/skills/user/:userId ─────────────────────────
exports.getSkillsByUser = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return next(new AppError('Invalid user ID', 400));
  }

   const skills = await Skill.find({
    user: userId,
    $or: [{ isActive: true }, { isLearned: true }],
  }).populate('user', 'name avatar');

  sendResponse(res, 200, 'User skills fetched successfully', { skills });
});

// ── GET /api/skills/:id ──────────────────────────────────
exports.getSkillById = asyncHandler(async (req, res, next) => {
  const skill = await Skill.findById(req.params.id)
    .populate('user', 'name avatar location bio credits');

  if (!skill || !skill.isActive) {
    return next(new AppError('Skill not found', 404));
  }

  // Fire and forget — don't await, don't block the response
  Skill.findByIdAndUpdate(req.params.id, { 
    $inc: { 'stats.views': 1 } 
  }).exec();

  sendResponse(res, 200, 'Skill fetched successfully', { skill });
});

// ── POST /api/skills ─────────────────────────────────────
exports.createSkill = asyncHandler(async (req, res) => {
  const { title, description, category, type, level, creditCost, tags = [] } = req.body;

  const skill = await Skill.create({
    user: req.user._id,
    title, description, category, type, level,
    creditCost: type === 'learn' ? 0 : Number(creditCost), // ← force 0 for learn
    tags: tags.map(t => t.toLowerCase().trim()),
  });

  // Sync tags back to user profile for fast matching
  const tagField = type === 'teach' ? 'teachTags' : 'learnTags';
  await User.findByIdAndUpdate(req.user._id, {
    $addToSet: { [tagField]: { $each: skill.tags } },
  });

  sendResponse(res, 201, 'Skill created successfully', { skill });
});

// ── PUT /api/skills/:id ──────────────────────────────────
exports.updateSkill = asyncHandler(async (req, res, next) => {
  const skill = await Skill.findById(req.params.id);

  if (!skill || !skill.isActive) return next(new AppError('Skill not found', 404));
  if (skill.user.toString() !== req.user._id.toString()) {
    return next(new AppError('You can only edit your own skills', 403));
  }

  const allowed = ['title', 'description', 'category', 'level', 'creditCost', 'tags'];
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) skill[field] = req.body[field];
  });

  await skill.save();
  sendResponse(res, 200, 'Skill updated successfully', { skill });
});

// ── DELETE /api/skills/:id ───────────────────────────────
exports.deleteSkill = asyncHandler(async (req, res, next) => {
  const skill = await Skill.findById(req.params.id);

  if (!skill || !skill.isActive) return next(new AppError('Skill not found', 404));
  if (skill.user.toString() !== req.user._id.toString()) {
    return next(new AppError('You can only delete your own skills', 403));
  }

  // Soft delete — never hard delete production data
  skill.isActive = false;
  await skill.save();

  sendResponse(res, 200, 'Skill deleted successfully', null);
});