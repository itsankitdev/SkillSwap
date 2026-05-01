const router = require('express').Router();
const { protect } = require('../middleware/auth.middleware');
const {
  proposeSession,
  getMySessions,
  getSession,
  updateSession,
  deleteSession,
} = require('../controllers/session.controller');

router.use(protect);

router.get('/',     getMySessions);
router.post('/',    proposeSession);
router.get('/:id',  getSession);
router.put('/:id',  updateSession);
router.delete('/:id', deleteSession);

module.exports = router;