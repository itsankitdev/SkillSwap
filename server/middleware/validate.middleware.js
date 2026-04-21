const { validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

// Reads validation errors set by express-validator rules and short-circuits
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors.array()[0].msg; // Return first error only
    return next(new AppError(message, 400));
  }
  next();
};

module.exports = validate;