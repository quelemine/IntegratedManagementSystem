const express = require('express');
const router = express.Router();
const {
  getMessages,
  getMessageById,
  createMessage,
  markAsRead,
  deleteMessage
} = require('../controllers/messageController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// GET /api/messages - Get all messages for the user
router.get('/', getMessages);

// GET /api/messages/:id - Get a specific message
router.get('/:id', getMessageById);

// POST /api/messages - Create a new message
router.post('/', createMessage);

// PUT /api/messages/:id/read - Mark message as read
router.put('/:id/read', markAsRead);

// DELETE /api/messages/:id - Delete a message
router.delete('/:id', deleteMessage);

module.exports = router;
