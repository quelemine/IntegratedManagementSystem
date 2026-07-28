const bcrypt = require('bcryptjs');
const { generateToken, generateRefreshToken, verifyRefreshToken } = require('../config/jwt');
const db = require('../config/database');
const { logAction } = require('../middleware/audit');

/**
 * Check if account is locked due to too many failed attempts
 */
const isAccountLocked = async (email) => {
  const recentFailures = await db('login_attempts')
    .where('email', email)
    .where('success', false)
    .where('created_at', '>', db.raw("NOW() - INTERVAL '15 minutes'"))
    .count('* as count')
    .first();

  return parseInt(recentFailures.count) >= 5; // Lock after 5 failed attempts
};

/**
 * Record login attempt
 */
const recordLoginAttempt = async (email, userId, success, ipAddress, userAgent, failureReason = null) => {
  await db('login_attempts').insert({
    id: db.raw('gen_random_uuid()'),
    user_id: userId,
    email,
    ip_address: ipAddress,
    user_agent: userAgent,
    success,
    failure_reason: failureReason
  });
};

/**
 * Get user's login history
 */
const getLoginHistory = async (userId, limit = 20) => {
  return await db('login_attempts')
    .where('user_id', userId)
    .orderBy('created_at', 'desc')
    .limit(limit);
};

/**
 * Generate email from name (first initial + last name)
 * Handles middle names by taking initials of all first name parts
 * Examples:
 * - John Doe → jdoe@simtechinstitute.edu
 * - Jane Smith → jsmith@simtechinstitute.edu
 * - John Michael Doe → jmdoe@simtechinstitute.edu
 * - Mary Ann Johnson → majohnson@simtechinstitute.edu
 */
const generateEmailFromName = (firstName, lastName, schoolDomain = 'simtechinstitute.edu') => {
  // Split first name into parts (handles middle names)
  const firstNameParts = firstName.trim().split(/\s+/);
  
  // Get initials from all first name parts
  const firstNameInitials = firstNameParts
    .map(part => part.charAt(0).toLowerCase())
    .join('');
  
  // Get last name (lowercase, remove spaces/special characters)
  const cleanLastName = lastName.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // Combine: first name initials + last name
  const emailPrefix = `${firstNameInitials}${cleanLastName}`;
  
  return `${emailPrefix}@${schoolDomain}`;
};

/**
 * Generate unique email from name (handles duplicates)
 */
const generateUniqueEmail = async (firstName, lastName, schoolDomain = 'simtechinstitute.edu') => {
  let baseEmail = generateEmailFromName(firstName, lastName, schoolDomain);
  let email = baseEmail;
  let counter = 1;
  
  // Check if email exists and add number if needed
  while (true) {
    const existingUser = await db('users').where('email', email).first();
    if (!existingUser) {
      break;
    }
    
    // Add number to email
    const cleanLastName = lastName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const firstNameParts = firstName.trim().split(/\s+/);
    const firstNameInitials = firstNameParts
      .map(part => part.charAt(0).toLowerCase())
      .join('');
    email = `${firstNameInitials}${cleanLastName}${counter}@${schoolDomain}`;
    counter++;
  }
  
  return email;
};

/**
 * Register a new user
 */
const register = async (req, res) => {
  try {
    const { email, password, first_name, last_name, phone, role_id, school_id } = req.body;

    // Generate email if not provided
    let userEmail = email;
    if (!userEmail) {
      userEmail = await generateUniqueEmail(first_name, last_name);
    }

    // Check if email already exists
    const existingUser = await db('users').where('email', userEmail).first();
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password with stronger rounds for production
    const saltRounds = process.env.NODE_ENV === 'production' ? 12 : 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const [userId] = await db('users').insert({
      email: userEmail,
      password: hashedPassword,
      first_name,
      last_name,
      phone,
      role_id,
      school_id,
      is_active: true
    }).returning('id');

    // Log registration
    await logAction(school_id, userId, 'create', 'user', userId, null, { email: userEmail, first_name, last_name }, req.ip, req.headers['user-agent']);

    // Generate tokens
    const token = generateToken({ id: userId, email: userEmail, role_id, school_id });
    const refreshToken = generateRefreshToken({ id: userId });

    res.status(201).json({
      message: 'User registered successfully',
      data: {
        user: { id: userId, email: userEmail, first_name, last_name, role_id, school_id },
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

    console.log('[LOGIN] Attempt for email:', email);
    console.log('[LOGIN] Environment:', process.env.NODE_ENV);
    console.log('[LOGIN] JWT_SECRET configured:', !!process.env.JWT_SECRET);

    // Check if account is locked
    try {
      const locked = await isAccountLocked(email);
      if (locked) {
        console.log('[LOGIN] Account locked for email:', email);
        await recordLoginAttempt(email, null, false, req.ip, req.headers['user-agent'], 'Account locked');
        return res.status(429).json({ error: 'Account temporarily locked due to too many failed attempts. Please try again in 15 minutes.' });
      }
    } catch (lockError) {
      console.error('[LOGIN] Error checking account lock:', lockError.message);
      // Continue with login attempt if lock check fails
    }

    // Find user
    let user;
    try {
      console.log('[LOGIN] Querying database for user with email:', email);
      user = await db('users').where('email', email).first();
      console.log('[LOGIN] Database query completed, user found:', !!user);
    } catch (dbError) {
      console.error('[LOGIN] Database query error:', dbError.message);
      console.error('[LOGIN] Database error stack:', dbError.stack);
      return res.status(500).json({ error: 'Database error during login' });
    }

    if (!user) {
      console.log('[LOGIN] User not found for email:', email);
      await recordLoginAttempt(email, null, false, req.ip, req.headers['user-agent'], 'Invalid email');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('[LOGIN] User found:', user.id, user.email, 'is_active:', user.is_active);
    console.log('[LOGIN] User has password hash:', !!user.password);

    // Check if user is active
    if (!user.is_active) {
      console.log('[LOGIN] User account inactive:', user.id);
      await recordLoginAttempt(email, user.id, false, req.ip, req.headers['user-agent'], 'Account inactive');
      return res.status(401).json({ error: 'Account is inactive' });
    }

    // Verify password
    let isValidPassword;
    try {
      console.log('[LOGIN] Starting password comparison for user:', user.id);
      isValidPassword = await bcrypt.compare(password, user.password);
      console.log('[LOGIN] Password comparison result:', isValidPassword);
    } catch (bcryptError) {
      console.error('[LOGIN] Bcrypt comparison error:', bcryptError.message);
      console.error('[LOGIN] Bcrypt error stack:', bcryptError.stack);
      return res.status(500).json({ error: 'Password verification error' });
    }
    
    if (!isValidPassword) {
      console.log('[LOGIN] Invalid password for user:', user.id);
      await recordLoginAttempt(email, user.id, false, req.ip, req.headers['user-agent'], 'Invalid password');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Record successful login
    try {
      await recordLoginAttempt(email, user.id, true, req.ip, req.headers['user-agent']);
    } catch (recordError) {
      console.error('[LOGIN] Error recording login attempt:', recordError.message);
      // Continue with login even if recording fails
    }

    // Update last login
    try {
      await db('users').where('id', user.id).update({ last_login: new Date() });
    } catch (updateError) {
      console.error('[LOGIN] Error updating last login:', updateError.message);
      // Continue with login even if update fails
    }

    // Log login
    try {
      await logAction(user.school_id, user.id, 'login', 'user', user.id, null, null, req.ip, req.headers['user-agent']);
    } catch (auditError) {
      console.error('[LOGIN] Error logging audit action:', auditError.message);
      // Continue with login even if audit logging fails
    }

    // Check if user is using default password
    const usingDefaultPassword = isDefaultPassword(password);

    // Generate tokens
    console.log('[LOGIN] Generating tokens for user:', user.id);
    
    if (!process.env.JWT_SECRET) {
      console.error('[LOGIN] JWT_SECRET is not configured!');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    let token, refreshToken;
    try {
      token = generateToken({ 
        id: user.id, 
        email: user.email, 
        role_id: user.role_id, 
        school_id: user.school_id 
      });
      refreshToken = generateRefreshToken({ id: user.id });
      console.log('[LOGIN] Token generated successfully:', !!token);
      console.log('[LOGIN] Refresh token generated successfully:', !!refreshToken);
    } catch (tokenError) {
      console.error('[LOGIN] Token generation error:', tokenError.message);
      console.error('[LOGIN] Token error stack:', tokenError.stack);
      return res.status(500).json({ error: 'Token generation error' });
    }

    // Get role name
    let role;
    try {
      role = await db('roles').where('id', user.role_id).first();
      console.log('[LOGIN] User role:', role ? role.name : 'null');
    } catch (roleError) {
      console.error('[LOGIN] Error fetching role:', roleError.message);
      // Continue with login even if role fetch fails
      role = null;
    }

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
          school_id: user.school_id,
          forcePasswordChange: usingDefaultPassword
        },
        token,
        refreshToken
      }
    });
  } catch (error) {
    console.error('[LOGIN] Unhandled error:', error.message);
    console.error('[LOGIN] Error name:', error.name);
    console.error('[LOGIN] Error stack:', error.stack);
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
 * Password strength validation
 */
const validatePasswordStrength = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (password.length < minLength) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!hasUpperCase) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!hasLowerCase) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!hasNumbers) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  if (!hasSpecialChar) {
    return { valid: false, message: 'Password must contain at least one special character' };
  }

  return { valid: true };
};

/**
 * Check if password is default (for forcing password change)
 */
const isDefaultPassword = (password) => {
  const defaultPasswords = ['password', 'Password123', '12345678', 'admin', 'Admin123'];
  return defaultPasswords.includes(password);
};

/**
 * Generate secure random token
 */
const generateSecureToken = () => {
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Forgot password - generates reset token
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    const user = await db('users').where('email', email).first();
    if (!user) {
      // Don't reveal if email exists for security
      return res.json({ 
        success: true, 
        message: 'If email exists, password reset instructions will be sent' 
      });
    }

    // Delete any existing unused tokens for this user
    await db('password_reset_tokens')
      .where('user_id', user.id)
      .where('used', false)
      .where('expires_at', '>', db.raw('NOW()'))
      .del();

    // Generate new token
    const token = generateSecureToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    await db('password_reset_tokens').insert({
      id: db.raw('gen_random_uuid()'),
      user_id: user.id,
      token,
      expires_at: expiresAt,
      used: false
    });

    // In production, send email with reset link
    // For now, log the token (in production, never log tokens)
    console.log(`Password reset token for ${email}: ${token}`);
    console.log(`Reset link would be: http://yourdomain.com/reset-password?token=${token}`);

    res.json({ 
      success: true, 
      message: 'If email exists, password reset instructions will be sent' 
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, error: 'Failed to process request' });
  }
};

/**
 * Reset password using token
 */
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ success: false, error: 'Token and password are required' });
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ success: false, error: passwordValidation.message });
    }

    // Find valid token
    const resetToken = await db('password_reset_tokens')
      .where('token', token)
      .where('used', false)
      .where('expires_at', '>', db.raw('NOW()'))
      .first();

    if (!resetToken) {
      return res.status(400).json({ success: false, error: 'Invalid or expired token' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password
    await db('users')
      .where('id', resetToken.user_id)
      .update({ 
        password: hashedPassword,
        updated_at: db.raw('NOW()')
      });

    // Mark token as used
    await db('password_reset_tokens')
      .where('id', resetToken.id)
      .update({ used: true });

    // Log audit
    await logAction(
      null,
      resetToken.user_id,
      'update',
      'user',
      resetToken.user_id,
      null,
      { action: 'password_reset' },
      req.ip,
      req.headers['user-agent']
    );

    res.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, error: 'Failed to reset password' });
  }
};

/**
 * Change password (authenticated user)
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: 'Current and new passwords are required' });
    }

    // Validate new password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({ success: false, error: passwordValidation.message });
    }

    // Check if new password is same as current
    if (currentPassword === newPassword) {
      return res.status(400).json({ success: false, error: 'New password must be different from current password' });
    }

    // Get user
    const user = await db('users').where('id', userId).first();
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await db('users')
      .where('id', userId)
      .update({ 
        password: hashedPassword,
        updated_at: db.raw('NOW()')
      });

    // Log audit
    await logAction(
      req.user.school_id,
      userId,
      'update',
      'user',
      userId,
      null,
      { action: 'password_change' },
      req.ip,
      req.headers['user-agent']
    );

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, error: 'Failed to change password' });
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
  resetPassword,
  getLoginHistory
};
