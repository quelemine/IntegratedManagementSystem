const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { logAction } = require('../middleware/audit');

/**
 * Get all users (school-scoped)
 */
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const offset = (page - 1) * limit;

    let query = db('users')
      .select('users.id', 'users.email', 'users.first_name', 'users.last_name', 'users.phone', 'users.profile_image', 'users.is_active', 'users.last_login', 'users.created_at')
      .select('roles.name as role_name')
      .join('roles', 'users.role_id', 'roles.id')
      .where('users.school_id', req.user.school_id);

    if (role) {
      query = query.where('roles.name', role);
    }

    if (search) {
      query = query.where(function() {
        this.where('users.first_name', 'ilike', `%${search}%`)
          .orWhere('users.last_name', 'ilike', `%${search}%`)
          .orWhere('users.email', 'ilike', `%${search}%`);
      });
    }

    const users = await query
      .orderBy('users.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    const total = await db('users')
      .join('roles', 'users.role_id', 'roles.id')
      .where('users.school_id', req.user.school_id)
      .modify(function(q) {
        if (role) q.where('roles.name', role);
        if (search) {
          q.where(function() {
            this.where('users.first_name', 'ilike', `%${search}%`)
              .orWhere('users.last_name', 'ilike', `%${search}%`)
              .orWhere('users.email', 'ilike', `%${search}%`);
          });
        }
      })
      .count('* as count')
      .first();

    res.json({
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(total.count),
        totalPages: Math.ceil(total.count / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
};

/**
 * Get user by ID
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await db('users')
      .select('users.id', 'users.email', 'users.first_name', 'users.last_name', 'users.phone', 'users.profile_image', 'users.is_active', 'users.last_login', 'users.created_at', 'users.role_id', 'users.school_id')
      .select('roles.name as role_name', 'roles.permissions as role_permissions')
      .join('roles', 'users.role_id', 'roles.id')
      .where('users.id', id)
      .where('users.school_id', req.user.school_id)
      .first();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ data: user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
};

/**
 * Create user (Super Admin only)
 */
const createUser = async (req, res) => {
  try {
    const { email, password, first_name, last_name, phone, role_id, school_id } = req.body;

    // Check if email already exists
    const existingUser = await db('users').where('email', email).first();
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const [userId] = await db('users').insert({
      email,
      password: hashedPassword,
      first_name,
      last_name,
      phone,
      role_id,
      school_id: school_id || req.user.school_id,
      is_active: true
    }).returning('id');

    // Log creation
    await logAction(school_id || req.user.school_id, userId, 'create', 'user', userId, null, { email, first_name, last_name }, req.ip, req.headers['user-agent']);

    res.status(201).json({
      message: 'User created successfully',
      data: { id: userId, email, first_name, last_name }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

/**
 * Update user
 */
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, phone, profile_image, role_id, is_active } = req.body;

    // Get old values
    const oldUser = await db('users').where('id', id).where('school_id', req.user.school_id).first();
    if (!oldUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user
    await db('users').where('id', id).where('school_id', req.user.school_id).update({
      first_name,
      last_name,
      phone,
      profile_image,
      role_id,
      is_active,
      updated_at: new Date()
    });

    // Get updated user
    const user = await db('users').where('id', id).first();

    // Log update
    await logAction(req.user.school_id, req.user.id, 'update', 'user', id, oldUser, user, req.ip, req.headers['user-agent']);

    res.json({
      message: 'User updated successfully',
      data: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        profile_image: user.profile_image,
        is_active: user.is_active
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

/**
 * Delete user (soft delete - set is_active to false)
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Get old values
    const oldUser = await db('users').where('id', id).where('school_id', req.user.school_id).first();
    if (!oldUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Soft delete
    await db('users').where('id', id).where('school_id', req.user.school_id).update({
      is_active: false,
      updated_at: new Date()
    });

    // Log deletion
    await logAction(req.user.school_id, req.user.id, 'delete', 'user', id, oldUser, null, req.ip, req.headers['user-agent']);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

/**
 * Get users by role
 */
const getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;

    const users = await db('users')
      .select('users.id', 'users.email', 'users.first_name', 'users.last_name', 'users.phone', 'users.profile_image', 'users.is_active')
      .join('roles', 'users.role_id', 'roles.id')
      .where('roles.name', role)
      .where('users.school_id', req.user.school_id)
      .where('users.is_active', true)
      .orderBy('users.first_name');

    res.json({ data: users });
  } catch (error) {
    console.error('Get users by role error:', error);
    res.status(500).json({ error: 'Failed to get users by role' });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUsersByRole
};
