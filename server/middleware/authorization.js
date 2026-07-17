const db = require('../config/database');

/**
 * Role-based authorization middleware
 * Checks if user has required role or permission
 */
const authorize = (roles = [], permissions = []) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Get user's role with permissions
      const role = await db('roles')
        .where('id', req.user.role_id)
        .first();

      if (!role) {
        return res.status(403).json({ error: 'Invalid role' });
      }

      // Check if user has super admin role (all permissions)
      if (role.name === 'super_admin') {
        return next();
      }

      // Check role-based authorization
      if (roles.length > 0 && !roles.includes(role.name)) {
        return res.status(403).json({ error: 'Insufficient role permissions' });
      }

      // Check permission-based authorization
      if (permissions.length > 0) {
        const rolePermissions = role.permissions || [];
        const hasPermission = permissions.some(perm => 
          rolePermissions.includes(perm) || rolePermissions.includes('all')
        );
        
        if (!hasPermission) {
          return res.status(403).json({ error: 'Insufficient permissions' });
        }
      }

      next();
    } catch (error) {
      return res.status(500).json({ error: 'Authorization check failed' });
    }
  };
};

/**
 * School scope middleware - ensures user can only access their school's data
 */
const schoolScope = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Super admins can access all schools
    const role = await db('roles').where('id', req.user.role_id).first();
    if (role && role.name === 'super_admin') {
      return next();
    }

    // For other users, ensure they're accessing their own school
    req.schoolId = req.user.school_id;
    next();
  } catch (error) {
    return res.status(500).json({ error: 'School scope check failed' });
  }
};

module.exports = { authorize, schoolScope };
