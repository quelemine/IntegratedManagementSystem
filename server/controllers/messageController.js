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

    if (!receiver_id || !content) {
      return res.status(400).json({ success: false, error: 'Receiver ID and content are required' });
    }

    // Verify receiver exists and is in the same school
    const receiver = await db('users')
      .where('id', receiver_id)
      .where('school_id', schoolId)
      .first();

    if (!receiver) {
      return res.status(404).json({ success: false, error: 'Receiver not found' });
    }

    const [message] = await db('messages').insert({
      school_id: schoolId,
      sender_id,
      receiver_id,
      content,
      is_read: false
    }).returning('*');

    // Create notification for receiver
    await db('notifications').insert({
      user_id: receiver_id,
      title: 'New Message',
      message: `You have received a new message.`,
      type: 'message',
      reference_id: message.id,
      reference_type: 'message',
      is_read: false
    });

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    console.error('Create message error:', error);
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

module.exports = {
  getMessages,
  getMessageById,
  createMessage,
  markAsRead,
  deleteMessage
};
