const router = require('express').Router();
const { getMatches } = require('../controllers/matching.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', protect, getMatches);

module.exports = router;