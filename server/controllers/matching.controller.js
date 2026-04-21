const { User, Skill } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/sendResponse');
const AppError = require('../utils/AppError');

exports.getMatches = asyncHandler(async (req, res, next) => {
  const currentUser = await User.findById(req.user._id);

  const myLearnSkills = await Skill.find({
    user: currentUser._id,
    type: 'learn',
    isActive: true,
  });

  const myTeachSkills = await Skill.find({
    user: currentUser._id,
    type: 'teach',
    isActive: true,
  });

  if (myLearnSkills.length === 0 && myTeachSkills.length === 0) {
    return next(new AppError('Add some skills first to find matches', 400));
  }

  if (myLearnSkills.length === 0) {
    return next(new AppError('Add at least one learning skill to find matches', 400));
  }

  const learnCategories = [...new Set(myLearnSkills.map(s => s.category))];
  const teachCategories = [...new Set(myTeachSkills.map(s => s.category))];

  const allOtherUsers = await User.find({
    _id: { $ne: currentUser._id },
    isActive: true,
  }).select('name avatar bio location teachTags learnTags credits');

  if (allOtherUsers.length === 0) {
    return sendResponse(res, 200, 'No other users found', { total: 0, matches: [] });
  }

  const matchDetails = await Promise.all(
    allOtherUsers.map(async (matchUser) => {
      const theirTeachSkills = await Skill.find({
        user: matchUser._id,
        type: 'teach',
        isActive: true,
        category: { $in: learnCategories },
      });

      const theirLearnSkills = await Skill.find({
        user: matchUser._id,
        type: 'learn',
        isActive: true,
        category: { $in: teachCategories },
      });

      return {
        user: matchUser,
        theirTeachSkills,
        theirLearnSkills,
        teachOverlap: theirTeachSkills.length,
        learnOverlap: theirLearnSkills.length,
        isMutual: theirTeachSkills.length > 0 && theirLearnSkills.length > 0,
        score: theirTeachSkills.length * 2 + theirLearnSkills.length,
      };
    })
  );

  const matches = matchDetails
    .filter(m => m.teachOverlap > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);

  sendResponse(res, 200, 'Matches found successfully', {
    total: matches.length,
    matches,
  });
});