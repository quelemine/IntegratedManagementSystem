const express = require('express');
const router = express.Router();
const {
  getNotifications,
  getUnreadCount,
  getNotificationHistory,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationPreferences,
  updateNotificationPreferences,
  sendSystemNotification
} = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorization');

// All routes require authentication
router.use(authenticate);

// GET /api/notifications - Get all notifications for the user
router.get('/', getNotifications);

// GET /api/notifications/history - Get notification history (paginated)
router.get('/history', getNotificationHistory);

// GET /api/notifications/unread-count - Get unread notification count
router.get('/unread-count', getUnreadCount);

// GET /api/notifications/preferences - Get user notification preferences
router.get('/preferences', getNotificationPreferences);

// PUT /api/notifications/preferences - Update user notification preferences
router.put('/preferences', updateNotificationPreferences);

// PUT /api/notifications/:id/read - Mark notification as read
router.put('/:id/read', markAsRead);

// PUT /api/notifications/mark-all-read - Mark all notifications as read
router.put('/mark-all-read', markAllAsRead);

// DELETE /api/notifications/:id - Delete a notification
router.delete('/:id', deleteNotification);

// POST /api/notifications/system - Send system-wide notification (admin only)
router.post('/system', authorize(['admin', 'super_admin', 'principal']), sendSystemNotification);

module.exports = router;
