const { User, CreditTransaction } = require('../models');
const AppError = require('./AppError');

exports.transferCredits = async ({
  fromUserId, toUserId, amount, description, relatedRequestId
}) => {
  const sender = await User.findById(fromUserId);
  const receiver = await User.findById(toUserId);

  if (!sender || !receiver) {
    throw new AppError('User not found during credit transfer', 404);
  }

  // Credits already deducted from sender at request creation
  // Just add them to receiver now
  receiver.credits += amount;
  await receiver.save();

  await CreditTransaction.create({
    user: fromUserId,
    type: 'spend',
    amount: -amount,
    balanceAfter: sender.credits,
    description,
    relatedRequest: relatedRequestId,
    relatedUser: toUserId,
  });

  await CreditTransaction.create({
    user: toUserId,
    type: 'earn',
    amount,
    balanceAfter: receiver.credits,
    description,
    relatedRequest: relatedRequestId,
    relatedUser: fromUserId,
  });

  return { senderBalance: sender.credits, receiverBalance: receiver.credits };
};

exports.refundCredits = async ({
  userId, amount, description, relatedRequestId
}) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found during refund', 404);

  user.credits += amount;
  await user.save();

  await CreditTransaction.create({
    user: userId,
    type: 'refund',
    amount,
    balanceAfter: user.credits,
    description,
    relatedRequest: relatedRequestId,
  });

  return { balance: user.credits };
};