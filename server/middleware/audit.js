const db = require('../config/database');

/**
 * Audit logging middleware
 * Logs important actions to the audit_logs table
 */
const auditLog = (action) => {
  return async (req, res, next) => {
    // Store original res.json to intercept response
    const originalJson = res.json;
    
    res.json = function(data) {
      // Only log on successful operations
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        logAudit(req, action, data).catch(err => {
          console.error('Audit log error:', err);
        });
      }
      return originalJson.call(this, data);
    };
    
    next();
  };
};

/**
 * Helper function to log audit entry
 */
async function logAudit(req, action, responseData) {
  try {
    // Determine entity type and ID from request
    const entityType = req.params.id ? determineEntityType(req.path) : null;
    const entityId = req.params.id || null;
    
    // Capture old values for update operations
    let oldValues = null;
    if (action === 'update' && entityId) {
      oldValues = await getOldValues(entityType, entityId, req.user.school_id);
    }
    
    // Capture new values
    const newValues = action === 'delete' ? null : (responseData.data || responseData);
    
    await db('audit_logs').insert({
      school_id: req.user.school_id,
      user_id: req.user.id,
      action: action,
      entity_type: entityType,
      entity_id: entityId,
      old_values: oldValues ? JSON.stringify(oldValues) : null,
      new_values: newValues ? JSON.stringify(newValues) : null,
      ip_address: req.ip || req.connection.remoteAddress,
      user_agent: req.headers['user-agent']
    });
  } catch (error) {
    console.error('Failed to log audit entry:', error);
  }
}

/**
 * Determine entity type from request path
 */
function determineEntityType(path) {
  if (path.includes('/students')) return 'student';
  if (path.includes('/teachers')) return 'teacher';
  if (path.includes('/users')) return 'user';
  if (path.includes('/grades')) return 'grade';
  if (path.includes('/payments')) return 'payment';
  if (path.includes('/schools')) return 'school';
  if (path.includes('/classes')) return 'class';
  if (path.includes('/attendance')) return 'attendance';
  return null;
}

/**
 * Get old values before update
 */
async function getOldValues(entityType, entityId, schoolId) {
  try {
    let tableName;
    switch (entityType) {
      case 'student': tableName = 'students'; break;
      case 'teacher': tableName = 'teachers'; break;
      case 'user': tableName = 'users'; break;
      case 'grade': tableName = 'student_grades'; break;
      case 'payment': tableName = 'payments'; break;
      case 'school': tableName = 'schools'; break;
      case 'class': tableName = 'classes'; break;
      default: return null;
    }
    
    const record = await db(tableName)
      .where('id', entityId)
      .where('school_id', schoolId)
      .first();
    
    return record;
  } catch (error) {
    return null;
  }
}

/**
 * Manual audit log function for special cases
 */
const logAction = async (schoolId, userId, action, entityType, entityId, oldValues, newValues, ip, userAgent) => {
  try {
    await db('audit_logs').insert({
      school_id: schoolId,
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      old_values: oldValues ? JSON.stringify(oldValues) : null,
      new_values: newValues ? JSON.stringify(newValues) : null,
      ip_address: ip,
      user_agent: userAgent
    });
  } catch (error) {
    console.error('Failed to log manual audit entry:', error);
  }
};

module.exports = { auditLog, logAction };
