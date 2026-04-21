const router = require('express').Router();
const { getBalance, getHistory } = require('../controllers/credit.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/balance', getBalance);
router.get('/history', getHistory);

module.exports = router;