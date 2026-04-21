// Single import point for all models
// Usage: const { User, Skill } = require('../models');

const User = require('./User.model');
const Skill = require('./Skill.model');
const SwapRequest = require('./SwapRequest.model');
const CreditTransaction = require('./CreditTransaction.model');

module.exports = { User, Skill, SwapRequest, CreditTransaction };