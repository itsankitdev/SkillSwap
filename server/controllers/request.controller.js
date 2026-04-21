const { SwapRequest, Skill, User } = require('../models');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/sendResponse');
const { transferCredits, refundCredits } = require('../utils/creditService');

// ── GET /api/requests ────────────────────────────────────
exports.getMyRequests = asyncHandler(async (req, res) => {
  const { status, role } = req.query;
  const userId = req.user._id;

  const filter = {};
  if (status) filter.status = status;

  if (role === 'sent') filter.sender = userId;
  else if (role === 'received') filter.receiver = userId;
  else filter.$or = [{ sender: userId }, { receiver: userId }];

  const requests = await SwapRequest.find(filter)
    .populate('sender', 'name avatar')
    .populate('receiver', 'name avatar')
    .populate('offeredSkill', 'title category creditCost')
    .populate('wantedSkill', 'title category creditCost')
    .sort({ createdAt: -1 });

  sendResponse(res, 200, 'Requests fetched successfully', { requests });
});

// ── POST /api/requests ───────────────────────────────────
exports.createRequest = asyncHandler(async (req, res, next) => {
  const { receiver, offeredSkill, wantedSkill, message } = req.body;
  const senderId = req.user._id;

  // Guard: can't request yourself
  if (receiver === senderId.toString()) {
    return next(new AppError('You cannot send a swap request to yourself', 400));
  }

  // Validate both skills exist
  const [offered, wanted] = await Promise.all([
    Skill.findById(offeredSkill),
    Skill.findById(wantedSkill),
  ]);

  if (!offered || !offered.isActive) {
    return next(new AppError('Offered skill not found', 404));
  }
  if (!wanted || !wanted.isActive) {
    return next(new AppError('Wanted skill not found', 404));
  }

  // Sender must own the offered skill
  if (offered.user.toString() !== senderId.toString()) {
    return next(new AppError('You can only offer your own skills', 403));
  }

  // Receiver must own the wanted skill
  if (wanted.user.toString() !== receiver) {
    return next(new AppError('Wanted skill does not belong to the receiver', 400));
  }

  // No duplicate pending requests
  const existing = await SwapRequest.findOne({
    sender: senderId,
    receiver,
    offeredSkill,
    wantedSkill,
    status: 'pending',
  });
  if (existing) {
    return next(new AppError('You already have a pending request for this swap', 400));
  }

  // Check credits
  const sender = await User.findById(senderId);
  const creditAmount = wanted.creditCost;
  if (sender.credits < creditAmount) {
    return next(
      new AppError(`You need ${creditAmount} credits. You have ${sender.credits}.`, 400)
    );
  }

  // ── Find sender's learn skill to store as reference ──
  // Match by title keyword first, fallback to category
  const wantedTitle = wanted.title;
  let senderLearnSkill = await Skill.findOne({
    user: senderId,
    type: 'learn',
    isLearned: false,
    isActive: true,
    title: { $regex: new RegExp(wantedTitle, 'i') },
  });

  // Fallback — match by category
  if (!senderLearnSkill) {
    senderLearnSkill = await Skill.findOne({
      user: senderId,
      type: 'learn',
      isLearned: false,
      isActive: true,
      category: wanted.category,
    });
  }

  console.log('📌 Storing senderLearnSkill:', senderLearnSkill ? {
    id: senderLearnSkill._id,
    title: senderLearnSkill.title,
  } : 'none found — will skip on completion');

  // Deduct credits from sender
  sender.credits -= creditAmount;
  await sender.save();

  // Create the swap request with senderLearnSkill reference
  const newRequest = await SwapRequest.create({
    sender: senderId,
    receiver,
    offeredSkill,
    wantedSkill,
    senderLearnSkill: senderLearnSkill?._id || null, // ← stored here
    message: message || '',
    creditAmount,
    status: 'pending',
  });

  // Update skill stats
  await Skill.findByIdAndUpdate(wantedSkill, {
    $inc: { 'stats.requestCount': 1 },
  });

  // Populate for response
  const populated = await SwapRequest.findById(newRequest._id)
    .populate('sender', 'name avatar')
    .populate('receiver', 'name avatar')
    .populate('offeredSkill', 'title category creditCost')
    .populate('wantedSkill', 'title category creditCost');

  sendResponse(res, 201, 'Swap request sent successfully', { request: populated });
});

// ── PUT /api/requests/:id ────────────────────────────────
exports.updateRequest = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  const userId = req.user._id.toString();

  const request = await SwapRequest.findById(req.params.id);
  if (!request) return next(new AppError('Request not found', 404));

  const isReceiver = request.receiver.toString() === userId;
  const isSender = request.sender.toString() === userId;

  // ── Permission checks ────────────────────────────────
  if (status === 'accepted' || status === 'rejected') {
    if (!isReceiver) return next(new AppError('Only the receiver can accept or reject', 403));
    if (request.status !== 'pending') return next(new AppError('Request is no longer pending', 400));
  }

  if (status === 'cancelled') {
    if (!isSender) return next(new AppError('Only the sender can cancel', 403));
    if (request.status !== 'pending') return next(new AppError('Only pending requests can be cancelled', 400));
  }

  if (status === 'completed') {
    if (!isReceiver) return next(new AppError('Only the receiver can mark as completed', 403));
    if (request.status !== 'accepted') return next(new AppError('Only accepted requests can be completed', 400));
  }

  // ── Actions ──────────────────────────────────────────
  if (status === 'accepted') {
    await transferCredits({
      fromUserId: request.sender,
      toUserId: request.receiver,
      amount: request.creditAmount,
      description: 'Skill swap payment',
      relatedRequestId: request._id,
    });
  }

  if (status === 'rejected' || status === 'cancelled') {
    await refundCredits({
      userId: request.sender,
      amount: request.creditAmount,
      description: `Refund for ${status} swap request`,
      relatedRequestId: request._id,
    });
  }

  if (status === 'completed') {
    request.completedAt = new Date();

    // Increment stats on teacher's offered skill
    await Skill.findByIdAndUpdate(request.offeredSkill, {
      $inc: { 'stats.completedSwaps': 1 },
    });

    // ── Mark sender's learn skill as learned ─────────
    // Use the stored reference — no guessing, 100% reliable
    if (request.senderLearnSkill) {
      const learnSkill = await Skill.findById(request.senderLearnSkill);
      console.log('📚 Found stored learn skill:', learnSkill ? {
        id: learnSkill._id,
        title: learnSkill.title,
        user: learnSkill.user,
      } : 'NOT FOUND');

      if (learnSkill) {
        learnSkill.isActive = false;
        learnSkill.isLearned = true;
        learnSkill.learnedAt = new Date();
        await learnSkill.save();
        console.log('✅ Learn skill marked on sender account:', request.sender);
      }
    } else {
      console.log('⚠️ No senderLearnSkill stored on this request — skipping');
    }
  }

  // ── Save final status ────────────────────────────────
  request.status = status;
  await request.save();

  sendResponse(res, 200, `Request ${status} successfully`, { request });
});

// ── DELETE /api/requests/:id ─────────────────────────────
exports.deleteRequest = asyncHandler(async (req, res, next) => {
  const request = await SwapRequest.findById(req.params.id);
  if (!request) return next(new AppError('Request not found', 404));

  if (request.sender.toString() !== req.user._id.toString()) {
    return next(new AppError('Only the sender can delete a request', 403));
  }

  if (!['rejected', 'cancelled', 'completed'].includes(request.status)) {
    return next(new AppError('Only closed requests can be deleted', 400));
  }

  await request.deleteOne();
  sendResponse(res, 200, 'Request deleted successfully', null);
});