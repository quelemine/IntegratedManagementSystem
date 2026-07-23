const db = require('../config/database');

/**
 * Get all notifications for the authenticated user
 */
const getNotifications = async (req, res) => {
  try {
    const { is_read, type } = req.query;
    const userId = req.user.id;

    let query = db('notifications')
      .where('user_id', userId)
      .orderBy('created_at', 'desc');

    if (is_read !== undefined) {
      query = query.where('is_read', is_read === 'true');
    }

    if (type) {
      query = query.where('type', type);
    }

    const notifications = await query;
    res.json({ success: true, data: notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch notifications' });
  }
};

/**
 * Get unread notification count
 */
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const count = await db('notifications')
      .where('user_id', userId)
      .where('is_read', false)
      .count('* as count')
      .first();

    res.json({ success: true, data: { count: parseInt(count.count) } });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch unread count' });
  }
};

/**
 * Mark notification as read
 */
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await db('notifications')
      .where('id', id)
      .where('user_id', userId)
      .first();

    if (!notification) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    await db('notifications')
      .where('id', id)
      .update({ is_read: true });

    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ success: false, error: 'Failed to mark notification as read' });
  }
};

/**
 * Mark all notifications as read
 */
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await db('notifications')
      .where('user_id', userId)
      .where('is_read', false)
      .update({ is_read: true });

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ success: false, error: 'Failed to mark all notifications as read' });
  }
};

/**
 * Delete a notification
 */
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await db('notifications')
      .where('id', id)
      .where('user_id', userId)
      .first();

    if (!notification) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    await db('notifications').where('id', id).del();

    res.json({ success: true, message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete notification' });
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
};
