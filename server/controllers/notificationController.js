const db = require('../config/database');

/**
 * Get all notifications for the authenticated user
 */
const getNotifications = async (req, res) => {
  try {
    const { is_read, type, category, priority } = req.query;
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

    if (category) {
      query = query.where('category', category);
    }

    if (priority) {
      query = query.where('priority', priority);
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
 * Get notification history (paginated)
 */
const getNotificationHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const notifications = await db('notifications')
      .where('user_id', userId)
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    const totalCount = await db('notifications')
      .where('user_id', userId)
      .count('* as count')
      .first();

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: parseInt(totalCount.count),
          totalPages: Math.ceil(parseInt(totalCount.count) / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get notification history error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch notification history' });
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
      .update({ 
        is_read: true,
        read_at: db.raw('NOW()')
      });

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
      .update({ 
        is_read: true,
        read_at: db.raw('NOW()')
      });

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

/**
 * Get user notification preferences
 */
const getNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user.id;

    let preferences = await db('notification_preferences')
      .where('user_id', userId)
      .first();

    // Create default preferences if not exists
    if (!preferences) {
      const [newPrefs] = await db('notification_preferences')
        .insert({
          id: db.raw('gen_random_uuid()'),
          user_id: userId
        })
        .returning('*');
      preferences = newPrefs;
    }

    res.json({ success: true, data: preferences });
  } catch (error) {
    console.error('Get notification preferences error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch notification preferences' });
  }
};

/**
 * Update user notification preferences
 */
const updateNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      helpdesk_notifications,
      fee_notifications,
      payment_notifications,
      attendance_notifications,
      grade_notifications,
      announcement_notifications,
      system_alerts,
      email_notifications
    } = req.body;

    const preferences = await db('notification_preferences')
      .where('user_id', userId)
      .first();

    if (preferences) {
      await db('notification_preferences')
        .where('user_id', userId)
        .update({
          helpdesk_notifications: helpdesk_notifications !== undefined ? helpdesk_notifications : preferences.helpdesk_notifications,
          fee_notifications: fee_notifications !== undefined ? fee_notifications : preferences.fee_notifications,
          payment_notifications: payment_notifications !== undefined ? payment_notifications : preferences.payment_notifications,
          attendance_notifications: attendance_notifications !== undefined ? attendance_notifications : preferences.attendance_notifications,
          grade_notifications: grade_notifications !== undefined ? grade_notifications : preferences.grade_notifications,
          announcement_notifications: announcement_notifications !== undefined ? announcement_notifications : preferences.announcement_notifications,
          system_alerts: system_alerts !== undefined ? system_alerts : preferences.system_alerts,
          email_notifications: email_notifications !== undefined ? email_notifications : preferences.email_notifications,
          updated_at: db.raw('NOW()')
        });
    } else {
      await db('notification_preferences').insert({
        id: db.raw('gen_random_uuid()'),
        user_id: userId,
        helpdesk_notifications,
        fee_notifications,
        payment_notifications,
        attendance_notifications,
        grade_notifications,
        announcement_notifications,
        system_alerts,
        email_notifications
      });
    }

    const updatedPreferences = await db('notification_preferences')
      .where('user_id', userId)
      .first();

    res.json({ success: true, data: updatedPreferences });
  } catch (error) {
    console.error('Update notification preferences error:', error);
    res.status(500).json({ success: false, error: 'Failed to update notification preferences' });
  }
};

/**
 * Create a notification (internal function, not exposed as route)
 */
const createNotification = async (userId, title, message, type, category = 'general', priority = 'medium', referenceId = null, referenceType = null) => {
  try {
    // Check user's notification preferences
    const preferences = await db('notification_preferences')
      .where('user_id', userId)
      .first();

    // If preferences exist and category is disabled, don't create notification
    if (preferences) {
      const categoryEnabled = {
        helpdesk: preferences.helpdesk_notifications,
        fees: preferences.fee_notifications,
        payments: preferences.payment_notifications,
        attendance: preferences.attendance_notifications,
        grades: preferences.grade_notifications,
        announcements: preferences.announcement_notifications,
        system: preferences.system_alerts,
        general: true
      };

      if (!categoryEnabled[category]) {
        return null;
      }
    }

    const [notification] = await db('notifications')
      .insert({
        id: db.raw('gen_random_uuid()'),
        user_id: userId,
        title,
        message,
        type,
        category,
        priority,
        reference_id: referenceId,
        reference_type: referenceType,
        is_read: false
      })
      .returning('*');

    return notification;
  } catch (error) {
    console.error('Create notification error:', error);
    return null;
  }
};

/**
 * Send system-wide notification (admin only)
 */
const sendSystemNotification = async (req, res) => {
  try {
    const { title, message, priority = 'medium', category = 'system' } = req.body;
    const schoolId = req.user.school_id;

    if (!title || !message) {
      return res.status(400).json({ success: false, error: 'Title and message are required' });
    }

    // Get all users in the school
    const users = await db('users')
      .where('school_id', schoolId)
      .where('is_active', true)
      .select('id');

    // Create notification for each user
    let createdCount = 0;
    for (const user of users) {
      const notification = await createNotification(
        user.id,
        title,
        message,
        'system',
        category,
        priority
      );
      if (notification) createdCount++;
    }

    res.json({
      success: true,
      message: `System notification sent to ${createdCount} users`
    });
  } catch (error) {
    console.error('Send system notification error:', error);
    res.status(500).json({ success: false, error: 'Failed to send system notification' });
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  getNotificationHistory,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationPreferences,
  updateNotificationPreferences,
  createNotification,
  sendSystemNotification
};
