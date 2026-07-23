const bcrypt = require('bcryptjs');
const { generateToken, generateRefreshToken, verifyRefreshToken } = require('../config/jwt');
const db = require('../config/database');
const { logAction } = require('../middleware/audit');

/**
 * Register a new user
 */
const register = async (req, res) => {
  try {
    const { email, password, first_name, last_name, phone, role_id, school_id } = req.body;

    // Check if email already exists
    const existingUser = await db('users').where('email', email).first();
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password with stronger rounds for production
    const saltRounds = process.env.NODE_ENV === 'production' ? 12 : 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const [userId] = await db('users').insert({
      email,
      password: hashedPassword,
      first_name,
      last_name,
      phone,
      role_id,
      school_id,
      is_active: true
    }).returning('id');

    // Log registration
    await logAction(school_id, userId, 'create', 'user', userId, null, { email, first_name, last_name }, req.ip, req.headers['user-agent']);

    // Generate tokens
    const token = generateToken({ id: userId, email, role_id, school_id });
    const refreshToken = generateRefreshToken({ id: userId });

    res.status(201).json({
      message: 'User registered successfully',
      data: {
        user: { id: userId, email, first_name, last_name, role_id, school_id },
        token,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

/**
 * Login user
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await db('users').where('email', email).first();
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({ error: 'Account is inactive' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await db('users').where('id', user.id).update({ last_login: new Date() });

    // Log login
    await logAction(user.school_id, user.id, 'login', 'user', user.id, null, null, req.ip, req.headers['user-agent']);

    // Generate tokens
    const token = generateToken({ 
      id: user.id, 
      email: user.email, 
      role_id: user.role_id, 
      school_id: user.school_id 
    });
    const refreshToken = generateRefreshToken({ id: user.id });

    // Get role name
    const role = await db('roles').where('id', user.role_id).first();

    res.json({
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: role ? role.name : null,
          role_id: user.role_id,
          school_id: user.school_id
        },
        token,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

/**
 * Logout user
 */
const logout = async (req, res) => {
  try {
    // Log logout
    await logAction(req.user.school_id, req.user.id, 'logout', 'user', req.user.id, null, null, req.ip, req.headers['user-agent']);

    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
};

/**
 * Get current user profile
 */
const getProfile = async (req, res) => {
  try {
    const user = await db('users')
      .where('id', req.user.id)
      .select('id', 'email', 'first_name', 'last_name', 'phone', 'profile_image', 'is_active', 'last_login', 'created_at')
      .first();

    const role = await db('roles').where('id', req.user.role_id).first();

    res.json({
      data: {
        ...user,
        role: role ? role.name : null
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
};

/**
 * Update user profile
 */
const updateProfile = async (req, res) => {
  try {
    const { first_name, last_name, phone, profile_image } = req.body;

    // Get old values
    const oldUser = await db('users').where('id', req.user.id).first();

    // Update user
    await db('users').where('id', req.user.id).update({
      first_name,
      last_name,
      phone,
      profile_image,
      updated_at: new Date()
    });

    // Get updated user
    const user = await db('users').where('id', req.user.id).first();

    // Log update
    await logAction(req.user.school_id, req.user.id, 'update', 'user', req.user.id, oldUser, user, req.ip, req.headers['user-agent']);

    res.json({
      message: 'Profile updated successfully',
      data: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        profile_image: user.profile_image
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

/**
 * Change password
 */
const changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    // Get user
    const user = await db('users').where('id', req.user.id).first();

    // Verify current password
    const isValidPassword = await bcrypt.compare(current_password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Update password
    await db('users').where('id', req.user.id).update({
      password: hashedPassword,
      updated_at: new Date()
    });

    // Log password change
    await logAction(req.user.school_id, req.user.id, 'update', 'user', req.user.id, { password: '***' }, { password: '***' }, req.ip, req.headers['user-agent']);

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
};

/**
 * Refresh token
 */
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Get user
    const user = await db('users').where('id', decoded.id).where('is_active', true).first();
    if (!user) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Generate new tokens
    const token = generateToken({ 
      id: user.id, 
      email: user.email, 
      role_id: user.role_id, 
      school_id: user.school_id 
    });
    const newRefreshToken = generateRefreshToken({ id: user.id });

    res.json({
      data: {
        token,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};

/**
 * Forgot password (placeholder - sends email in production)
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await db('users').where('email', email).first();
    if (!user) {
      // Don't reveal if email exists
      return res.json({ message: 'If email exists, password reset instructions will be sent' });
    }

    // In production, generate reset token and send email
    // For now, just log it
    console.log(`Password reset requested for: ${email}`);

    res.json({ message: 'If email exists, password reset instructions will be sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
};

/**
 * Reset password (placeholder)
 */
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    // In production, verify token and reset password
    // For now, just return success
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};

module.exports = {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  refreshToken,
  forgotPassword,
  resetPassword
};
