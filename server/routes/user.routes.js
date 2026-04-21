const router = require('express').Router();
const { getUserById, updateUser, deleteUser } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/:id', getUserById);
router.put('/:id', protect, updateUser);
router.delete('/:id', protect, deleteUser);

module.exports = router;