const db = require('../config/database');

/**
 * Get all messages for the authenticated user (both sent and received)
 */
const getMessages = async (req, res) => {
  try {
    const { is_read } = req.query;
    const userId = req.user.id;
    const schoolId = req.user.school_id;

    let query = db('messages')
      .select(
        'messages.*',
        'sender.first_name as sender_first_name',
        'sender.last_name as sender_last_name',
        'sender.email as sender_email',
        'receiver.first_name as receiver_first_name',
        'receiver.last_name as receiver_last_name',
        'receiver.email as receiver_email'
      )
      .leftJoin('users as sender', 'messages.sender_id', 'sender.id')
      .leftJoin('users as receiver', 'messages.receiver_id', 'receiver.id')
      .where('messages.school_id', schoolId)
      .where(function() {
        this.where('messages.sender_id', userId).orWhere('messages.receiver_id', userId);
      })
      .orderBy('messages.created_at', 'desc');

    if (is_read !== undefined) {
      query = query.where('messages.is_read', is_read === 'true');
    }

    const messages = await query;
    res.json({ success: true, data: messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch messages' });
  }
};

/**
 * Get a specific message by ID
 */
const getMessageById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const schoolId = req.user.school_id;

    const message = await db('messages')
      .select(
        'messages.*',
        'sender.first_name as sender_first_name',
        'sender.last_name as sender_last_name',
        'sender.email as sender_email',
        'receiver.first_name as receiver_first_name',
        'receiver.last_name as receiver_last_name',
        'receiver.email as receiver_email'
      )
      .leftJoin('users as sender', 'messages.sender_id', 'sender.id')
      .leftJoin('users as receiver', 'messages.receiver_id', 'receiver.id')
      .where('messages.id', id)
      .where('messages.school_id', schoolId)
      .where(function() {
        this.where('messages.sender_id', userId).orWhere('messages.receiver_id', userId);
      })
      .first();

    if (!message) {
      return res.status(404).json({ success: false, error: 'Message not found' });
    }

    res.json({ success: true, data: message });
  } catch (error) {
    console.error('Get message by ID error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch message' });
  }
};

/**
 * Create a new message
 */
const createMessage = async (req, res) => {
  try {
    const { receiver_id, content } = req.body;
    const sender_id = req.user.id;
    const schoolId = req.user.school_id;
    const sender_name = `${req.user.first_name} ${req.user.last_name}`;

    console.log('[Message] Creating message - sender_id:', sender_id, 'sender_name:', sender_name);
    console.log('[Message] receiver_id:', receiver_id);
    console.log('[Message] content:', content);

    if (!receiver_id || !content) {
      console.error('[Message] Missing receiver_id or content');
      return res.status(400).json({ success: false, error: 'Receiver ID and content are required' });
    }

    // Verify receiver exists and is in the same school
    const receiver = await db('users')
      .where('id', receiver_id)
      .where('school_id', schoolId)
      .first();

    if (!receiver) {
      console.error('[Message] Receiver not found:', receiver_id);
      return res.status(404).json({ success: false, error: 'Receiver not found' });
    }

    console.log('[Message] Receiver found:', receiver.id, receiver.first_name, receiver.last_name);

    const [message] = await db('messages').insert({
      school_id: schoolId,
      sender_id,
      receiver_id,
      content,
      is_read: false
    }).returning('*');

    console.log('[Message] Message created with ID:', message.id);

    // Create notification for receiver
    try {
      const [notification] = await db('notifications').insert({
        user_id: receiver_id,
        title: 'New Message',
        message: `${sender_name} sent you a message: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
        type: 'message',
        reference_id: message.id,
        reference_type: 'message',
        is_read: false
      }).returning('*');

      console.log('[Message] Notification created with ID:', notification.id, 'for user:', receiver_id);
    } catch (notifError) {
      console.error('[Message] Failed to create notification:', notifError);
      // Don't fail the request if notification creation fails
    }

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    console.error('[Message] Create message error:', error);
    res.status(500).json({ success: false, error: 'Failed to create message' });
  }
};

/**
 * Mark message as read
 */
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const schoolId = req.user.school_id;

    const message = await db('messages')
      .where('id', id)
      .where('school_id', schoolId)
      .where('receiver_id', userId)
      .first();

    if (!message) {
      return res.status(404).json({ success: false, error: 'Message not found or you are not the receiver' });
    }

    await db('messages')
      .where('id', id)
      .update({
        is_read: true,
        read_at: new Date()
      });

    res.json({ success: true, message: 'Message marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ success: false, error: 'Failed to mark message as read' });
  }
};

/**
 * Delete a message
 */
const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const schoolId = req.user.school_id;

    const message = await db('messages')
      .where('id', id)
      .where('school_id', schoolId)
      .where(function() {
        this.where('sender_id', userId).orWhere('receiver_id', userId);
      })
      .first();

    if (!message) {
      return res.status(404).json({ success: false, error: 'Message not found' });
    }

    await db('messages').where('id', id).del();

    res.json({ success: true, message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete message' });
  }
};

/**
 * Create a HelpDesk message (automatically routes to admin)
 */
const createHelpDeskMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const sender_id = req.user.id;
    const schoolId = req.user.school_id;
    const sender_name = `${req.user.first_name} ${req.user.last_name}`;

    console.log('[HelpDesk] Creating message - sender_id:', sender_id);
    console.log('[HelpDesk] sender_name:', sender_name);
    console.log('[HelpDesk] school_id:', schoolId);
    console.log('[HelpDesk] content:', content);

    if (!content) {
      console.error('[HelpDesk] Missing content');
      return res.status(400).json({ success: false, error: 'Message content is required' });
    }

    // Find an admin user in the same school (priority: super_admin > admin > principal)
    const adminUser = await db('users as u')
      .join('roles as r', 'u.role_id', 'r.id')
      .select('u.id', 'u.first_name', 'u.last_name', 'u.email', 'r.name as role_name')
      .where('u.school_id', schoolId)
      .where('u.is_active', true)
      .whereIn('r.name', ['super_admin', 'admin', 'principal'])
      .orderByRaw("CASE WHEN r.name = 'super_admin' THEN 1 WHEN r.name = 'admin' THEN 2 ELSE 3 END")
      .first();

    if (!adminUser) {
      console.error('[HelpDesk] No active admin found in school:', schoolId);
      return res.status(404).json({ 
        success: false, 
        error: 'No active administrator found in your school. Please contact support.' 
      });
    }

    const receiver_id = adminUser.id;
    console.log('[HelpDesk] Found admin receiver:', receiver_id, adminUser.role_name, adminUser.first_name, adminUser.last_name);

    // Create the message
    const [message] = await db('messages').insert({
      school_id: schoolId,
      sender_id,
      receiver_id,
      content,
      is_read: false
    }).returning('*');

    console.log('[HelpDesk] Message created with ID:', message.id);

    // Create notification for the admin
    try {
      const [notification] = await db('notifications').insert({
        user_id: receiver_id,
        title: 'New HelpDesk Message',
        message: `${sender_name} sent a HelpDesk message: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
        type: 'helpdesk',
        reference_id: message.id,
        reference_type: 'message',
        is_read: false
      }).returning('*');

      console.log('[HelpDesk] Notification created with ID:', notification.id);
    } catch (notifError) {
      console.error('[HelpDesk] Failed to create notification:', notifError);
      // Don't fail the request if notification creation fails
    }

    res.status(201).json({ 
      success: true, 
      data: message,
      message: 'Your message has been sent to the support team.'
    });
  } catch (error) {
    console.error('[HelpDesk] Error creating message:', error);
    console.error('[HelpDesk] Error name:', error.name);
    console.error('[HelpDesk] Error message:', error.message);
    console.error('[HelpDesk] Error stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send message. Please try again.' 
    });
  }
};

module.exports = {
  getMessages,
  getMessageById,
  createMessage,
  createHelpDeskMessage,
  markAsRead,
  deleteMessage
};
