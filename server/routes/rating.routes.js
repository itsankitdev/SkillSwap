const router = require('express').Router();
const { protect } = require('../middleware/auth.middleware');
const {
  submitRating,
  getUserRatings,
  getSessionRatingStatus,
} = require('../controllers/rating.controller');

router.post('/',                        protect, submitRating);
router.get('/user/:userId',             getUserRatings);
router.get('/session/:sessionId',       protect, getSessionRatingStatus);

module.exports = router;