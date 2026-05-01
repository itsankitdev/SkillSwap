const router = require('express').Router();
const { protect } = require('../middleware/auth.middleware');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAll,
} = require('../controllers/notification.controller');

router.use(protect);

router.get('/',                    getNotifications);
router.put('/read-all',            markAllAsRead);
router.delete('/clear-all',        clearAll);
router.put('/:id/read',            markAsRead);
router.delete('/:id',              deleteNotification);

module.exports = router;