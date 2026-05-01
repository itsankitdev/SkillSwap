const router = require('express').Router();
const { protect } = require('../middleware/auth.middleware');
const {
  getMyConversations,
  getMessages,
  sendMessage,
} = require('../controllers/chat.controller');

router.use(protect); // all chat routes require auth

router.get('/',                      getMyConversations);
router.get('/:conversationId',       getMessages);
router.post('/:conversationId',      sendMessage);

module.exports = router;