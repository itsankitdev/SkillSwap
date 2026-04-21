const { body, query } = require('express-validator');

exports.createSkillValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 3, max: 80 }).withMessage('Title must be 3–80 characters'),

  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),

  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn(['Technology','Design','Music','Language','Cooking','Fitness','Business','Arts & Crafts','Academic','Other'])
    .withMessage('Invalid category'),

  body('type')
    .notEmpty().withMessage('Type is required')
    .isIn(['teach', 'learn']).withMessage('Type must be teach or learn'),

  body('level')
    .optional()
    .isIn(['Beginner', 'Intermediate', 'Advanced']).withMessage('Invalid level'),

  body('creditCost')
    .custom((value, { req }) => {
      const type = req.body.type;
      if (type === 'learn') return true;
      if (value === undefined || value === null || value === '') {
        throw new Error('Credit cost is required for teach skills');
      }
      const num = Number(value);
      if (isNaN(num) || num < 1 || num > 20) {
        throw new Error('Credit cost must be between 1 and 20');
      }
      return true;
    }),

  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array'),
];

exports.browseSkillsValidator = [
  query('type').optional().isIn(['teach', 'learn']),
  query('category').optional().isString(),
  query('level').optional().isIn(['Beginner', 'Intermediate', 'Advanced']),
  query('minCredits').optional().isInt({ min: 1 }),
  query('maxCredits').optional().isInt({ max: 20 }),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
];