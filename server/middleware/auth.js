const { verifyToken } = require('../config/jwt');
const db = require('../config/database');

/**
 * Authentication middleware to verify JWT token
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }
    
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    // Verify user still exists and is active
    const user = await db('users')
      .select('users.id', 'users.email', 'users.role_id', 'users.school_id', 'users.first_name', 'users.last_name', 'users.is_active', 'roles.name as role')
      .join('roles', 'users.role_id', 'roles.id')
      .where('users.id', decoded.id)
      .where('users.is_active', true)
      .first();
    
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid token or user not active' });
    }
    
    req.user = {
      id: user.id,
      email: user.email,
      role_id: user.role_id,
      role: user.role,
      school_id: user.school_id,
      first_name: user.first_name,
      last_name: user.last_name
    };
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, error: 'Token expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }
    return res.status(401).json({ success: false, error: 'Authentication failed' });
  }
};

/**
 * Optional authentication - doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }
    
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    const user = await db('users')
      .where('id', decoded.id)
      .where('is_active', true)
      .first();
    
    if (user) {
      req.user = {
        id: user.id,
        email: user.email,
        role_id: user.role_id,
        school_id: user.school_id,
        first_name: user.first_name,
        last_name: user.last_name
      };
    }
    
    next();
  } catch (error) {
    next();
  }
};

module.exports = { authenticate, optionalAuth };
