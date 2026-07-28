/**
 * Audit Logging Service
 * Provides centralized audit trail functionality for tracking user actions
 */

const db = require('../config/database');

/**
 * Log an audit event
 * @param {Object} auditData - Audit event data
 * @param {string} auditData.school_id - School ID
 * @param {string} auditData.user_id - User ID who performed the action
 * @param {string} auditData.action - Action performed (e.g., 'LOGIN', 'CREATE', 'UPDATE', 'DELETE')
 * @param {string} auditData.entity_type - Type of entity affected (e.g., 'user', 'grade', 'payment')
 * @param {string} auditData.entity_id - ID of the entity affected
 * @param {Object} auditData.old_values - Previous values before change
 * @param {Object} auditData.new_values - New values after change
 * @param {string} auditData.ip_address - IP address of the user
 * @param {string} auditData.user_agent - User agent string
 */
const logAudit = async (auditData) => {
  try {
    const {
      school_id,
      user_id,
      action,
      entity_type,
      entity_id,
      old_values,
      new_values,
      ip_address,
      user_agent
    } = auditData;

    await db('audit_logs').insert({
      school_id,
      user_id,
      action,
      entity_type,
      entity_id,
      old_values: old_values ? JSON.stringify(old_values) : null,
      new_values: new_values ? JSON.stringify(new_values) : null,
      ip_address,
      user_agent
    });
  } catch (error) {
    console.error('Failed to log audit event:', error);
    // Don't throw error to avoid breaking the main operation
  }
};

/**
 * Get user information for audit logging
 * @param {Object} req - Express request object
 * @returns {Object} User information
 */
const getUserInfo = (req) => {
  return {
    user_id: req.user?.id,
    school_id: req.user?.school_id,
    ip_address: req.ip || req.connection?.remoteAddress,
    user_agent: req.headers['user-agent']
  };
};

/**
 * Log login event
 */
const logLogin = async (req, user) => {
  const userInfo = getUserInfo(req);
  await logAudit({
    ...userInfo,
    action: 'LOGIN',
    entity_type: 'user',
    entity_id: user.id,
    new_values: { email: user.email, role: user.role }
  });
};

/**
 * Log logout event
 */
const logLogout = async (req, user) => {
  const userInfo = getUserInfo(req);
  await logAudit({
    ...userInfo,
    action: 'LOGOUT',
    entity_type: 'user',
    entity_id: user.id,
    old_values: { email: user.email, role: user.role }
  });
};

/**
 * Log user creation
 */
const logUserCreate = async (req, newUser) => {
  const userInfo = getUserInfo(req);
  await logAudit({
    ...userInfo,
    action: 'CREATE',
    entity_type: 'user',
    entity_id: newUser.id,
    new_values: {
      email: newUser.email,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      role: newUser.role
    }
  });
};

/**
 * Log user update
 */
const logUserUpdate = async (req, userId, oldUser, newUser) => {
  const userInfo = getUserInfo(req);
  await logAudit({
    ...userInfo,
    action: 'UPDATE',
    entity_type: 'user',
    entity_id: userId,
    old_values: {
      email: oldUser.email,
      first_name: oldUser.first_name,
      last_name: oldUser.last_name,
      role: oldUser.role
    },
    new_values: {
      email: newUser.email,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      role: newUser.role
    }
  });
};

/**
 * Log password change
 */
const logPasswordChange = async (req, userId) => {
  const userInfo = getUserInfo(req);
  await logAudit({
    ...userInfo,
    action: 'PASSWORD_CHANGE',
    entity_type: 'user',
    entity_id: userId
  });
};

/**
 * Log role change
 */
const logRoleChange = async (req, userId, oldRole, newRole) => {
  const userInfo = getUserInfo(req);
  await logAudit({
    ...userInfo,
    action: 'ROLE_CHANGE',
    entity_type: 'user',
    entity_id: userId,
    old_values: { role: oldRole },
    new_values: { role: newRole }
  });
};

/**
 * Log grade update
 */
const logGradeUpdate = async (req, gradeId, oldGrade, newGrade) => {
  const userInfo = getUserInfo(req);
  await logAudit({
    ...userInfo,
    action: 'UPDATE',
    entity_type: 'student_grade',
    entity_id: gradeId,
    old_values: oldGrade,
    new_values: newGrade
  });
};

/**
 * Log fee change
 */
const logFeeChange = async (req, feeId, oldFee, newFee) => {
  const userInfo = getUserInfo(req);
  await logAudit({
    ...userInfo,
    action: 'UPDATE',
    entity_type: 'tuition_fee',
    entity_id: feeId,
    old_values: oldFee,
    new_values: newFee
  });
};

/**
 * Log payment record
 */
const logPayment = async (req, paymentData) => {
  const userInfo = getUserInfo(req);
  await logAudit({
    ...userInfo,
    action: 'CREATE',
    entity_type: 'payment',
    entity_id: paymentData.id,
    new_values: {
      student_id: paymentData.student_id,
      amount: paymentData.amount,
      currency: paymentData.currency,
      payment_method: paymentData.payment_method
    }
  });
};

/**
 * Log HelpDesk activity
 */
const logHelpDeskActivity = async (req, ticketId, action, oldData = null, newData = null) => {
  const userInfo = getUserInfo(req);
  await logAudit({
    ...userInfo,
    action,
    entity_type: 'helpdesk_ticket',
    entity_id: ticketId,
    old_values: oldData,
    new_values: newData
  });
};

/**
 * Log admin action
 */
const logAdminAction = async (req, action, entityType, entityId, oldValues = null, newValues = null) => {
  const userInfo = getUserInfo(req);
  await logAudit({
    ...userInfo,
    action,
    entity_type: entityType,
    entity_id: entityId,
    old_values: oldValues,
    new_values: newValues
  });
};

module.exports = {
  logAudit,
  getUserInfo,
  logLogin,
  logLogout,
  logUserCreate,
  logUserUpdate,
  logPasswordChange,
  logRoleChange,
  logGradeUpdate,
  logFeeChange,
  logPayment,
  logHelpDeskActivity,
  logAdminAction
};
