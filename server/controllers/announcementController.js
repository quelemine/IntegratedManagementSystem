const db = require('../config/database');

/**
 * Get all announcements for the user's role
 */
const getAnnouncements = async (req, res) => {
  try {
    const { is_active } = req.query;
    const userId = req.user.id;
    const schoolId = req.user.school_id;
    const userRole = req.user.role;

    let query = db('announcements')
      .select(
        'announcements.*',
        'creator.first_name as creator_first_name',
        'creator.last_name as creator_last_name'
      )
      .leftJoin('users as creator', 'announcements.created_by', 'creator.id')
      .where('announcements.school_id', schoolId)
      .orderBy('announcements.publish_date', 'desc');

    // Filter by active status
    if (is_active !== undefined) {
      query = query.where('announcements.is_active', is_active === 'true');
    }

    const announcements = await query;

    // Filter by target audience
    const filteredAnnouncements = announcements.filter(announcement => {
      if (!announcement.target_audience) return true;
      
      try {
        const target = JSON.parse(announcement.target_audience);
        if (target.roles && target.roles.includes('all')) return true;
        if (target.roles && target.roles.includes(userRole)) return true;
        return false;
      } catch (e) {
        return true;
      }
    });

    res.json({ success: true, data: filteredAnnouncements });
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch announcements' });
  }
};

/**
 * Get a specific announcement by ID
 */
const getAnnouncementById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const schoolId = req.user.school_id;
    const userRole = req.user.role;

    const announcement = await db('announcements')
      .select(
        'announcements.*',
        'creator.first_name as creator_first_name',
        'creator.last_name as creator_last_name'
      )
      .leftJoin('users as creator', 'announcements.created_by', 'creator.id')
      .where('announcements.id', id)
      .where('announcements.school_id', schoolId)
      .first();

    if (!announcement) {
      return res.status(404).json({ success: false, error: 'Announcement not found' });
    }

    // Check if user can view this announcement
    if (announcement.target_audience) {
      try {
        const target = JSON.parse(announcement.target_audience);
        if (target.roles && !target.roles.includes('all') && !target.roles.includes(userRole)) {
          return res.status(403).json({ success: false, error: 'You are not authorized to view this announcement' });
        }
      } catch (e) {
        // If parsing fails, allow viewing
      }
    }

    res.json({ success: true, data: announcement });
  } catch (error) {
    console.error('Get announcement by ID error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch announcement' });
  }
};

/**
 * Create a new announcement (Admin/Principal only)
 */
const createAnnouncement = async (req, res) => {
  try {
    const { title, content, target_audience, publish_date, expiry_date } = req.body;
    const created_by = req.user.id;
    const schoolId = req.user.school_id;
    const userRole = req.user.role;

    // Check if user has permission (also check role name from database)
    const user = await db('users')
      .join('roles', 'users.role_id', 'roles.id')
      .where('users.id', created_by)
      .first('roles.name as role_name');

    const actualRole = user ? user.role_name : userRole;

    if (actualRole !== 'admin' && actualRole !== 'principal') {
      return res.status(403).json({ success: false, error: 'You are not authorized to create announcements' });
    }

    if (!title || !content) {
      return res.status(400).json({ success: false, error: 'Title and content are required' });
    }

    const [announcement] = await db('announcements').insert({
      school_id: schoolId,
      created_by,
      title,
      content,
      target_audience: target_audience ? JSON.stringify(target_audience) : JSON.stringify({ roles: ['all'] }),
      publish_date: publish_date || new Date(),
      expiry_date: expiry_date || null,
      is_active: true
    }).returning('*');

    // Create notifications for target audience
    if (target_audience && target_audience.roles) {
      const roles = target_audience.roles;
      if (roles.includes('all')) {
        // Notify all users in the school
        const users = await db('users').where('school_id', schoolId).select('id');
        for (const user of users) {
          await db('notifications').insert({
            user_id: user.id,
            title: 'New Announcement',
            message: `A new announcement has been published: ${title}`,
            type: 'announcement',
            reference_id: announcement.id,
            reference_type: 'announcement',
            is_read: false
          });
        }
      } else {
        // Notify users with specific roles
        for (const role of roles) {
          const users = await db('users')
            .join('roles', 'users.role_id', 'roles.id')
            .where('users.school_id', schoolId)
            .where('roles.name', role)
            .select('users.id');
          
          for (const user of users) {
            await db('notifications').insert({
              user_id: user.id,
              title: 'New Announcement',
              message: `A new announcement has been published: ${title}`,
              type: 'announcement',
              reference_id: announcement.id,
              reference_type: 'announcement',
              is_read: false
            });
          }
        }
      }
    }

    res.status(201).json({ success: true, data: announcement });
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({ success: false, error: 'Failed to create announcement' });
  }
};

/**
 * Update an announcement (Admin/Principal only)
 */
const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, target_audience, is_active, expiry_date } = req.body;
    const userId = req.user.id;
    const schoolId = req.user.school_id;
    const userRole = req.user.role;

    // Check if user has permission (also check role name from database)
    const user = await db('users')
      .join('roles', 'users.role_id', 'roles.id')
      .where('users.id', userId)
      .first('roles.name as role_name');

    const actualRole = user ? user.role_name : userRole;

    if (actualRole !== 'admin' && actualRole !== 'principal') {
      return res.status(403).json({ success: false, error: 'You are not authorized to update announcements' });
    }

    const announcement = await db('announcements')
      .where('id', id)
      .where('school_id', schoolId)
      .first();

    if (!announcement) {
      return res.status(404).json({ success: false, error: 'Announcement not found' });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (target_audience !== undefined) updateData.target_audience = JSON.stringify(target_audience);
    if (is_active !== undefined) updateData.is_active = is_active;
    if (expiry_date !== undefined) updateData.expiry_date = expiry_date;
    updateData.updated_at = new Date();

    await db('announcements').where('id', id).update(updateData);

    const updated = await db('announcements').where('id', id).first();

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Update announcement error:', error);
    res.status(500).json({ success: false, error: 'Failed to update announcement' });
  }
};

/**
 * Delete an announcement (Admin/Principal only)
 */
const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const schoolId = req.user.school_id;
    const userRole = req.user.role;

    // Check if user has permission (also check role name from database)
    const user = await db('users')
      .join('roles', 'users.role_id', 'roles.id')
      .where('users.id', userId)
      .first('roles.name as role_name');

    const actualRole = user ? user.role_name : userRole;

    if (actualRole !== 'admin' && actualRole !== 'principal') {
      return res.status(403).json({ success: false, error: 'You are not authorized to delete announcements' });
    }

    const announcement = await db('announcements')
      .where('id', id)
      .where('school_id', schoolId)
      .first();

    if (!announcement) {
      return res.status(404).json({ success: false, error: 'Announcement not found' });
    }

    await db('announcements').where('id', id).del();

    res.json({ success: true, message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete announcement' });
  }
};

module.exports = {
  getAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
};
