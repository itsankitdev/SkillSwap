const { body } = require('express-validator');

exports.createRequestValidator = [
  body('receiver').notEmpty().withMessage('Receiver ID is required').isMongoId().withMessage('Invalid receiver ID'),
  body('offeredSkill').notEmpty().withMessage('Offered skill is required').isMongoId().withMessage('Invalid skill ID'),
  body('wantedSkill').notEmpty().withMessage('Wanted skill is required').isMongoId().withMessage('Invalid skill ID'),
  body('message').optional().isLength({ max: 300 }).withMessage('Message too long'),
];

exports.updateRequestValidator = [
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['accepted', 'rejected', 'completed', 'cancelled'])
    .withMessage('Invalid status value'),
];