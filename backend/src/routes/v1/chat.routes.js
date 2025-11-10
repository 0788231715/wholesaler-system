const express = require('express');
const {
  getOrCreateChat,
  getUserChats,
  getChatMessages,
  sendMessage,
  markAsRead
} = require('../../controllers/chat.controller');
const { protect } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.use(protect);

router.get('/', getUserChats);
router.post('/', getOrCreateChat);
router.get('/:id/messages', getChatMessages);
router.post('/:id/messages', sendMessage);
router.patch('/:id/read', markAsRead);

module.exports = router;