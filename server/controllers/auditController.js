const db = require('../config/database');

/**
 * Get all audit logs (admin only)
 */
const getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, action, entity_type, user_id, start_date, end_date } = req.query;
    const offset = (page - 1) * limit;
    const schoolId = req.user.school_id;

    let query = db('audit_logs')
      .select(
        'audit_logs.*',
        'users.first_name',
        'users.last_name',
        'users.email'
      )
      .leftJoin('users', 'audit_logs.user_id', 'users.id')
      .where('audit_logs.school_id', schoolId)
      .orderBy('audit_logs.timestamp', 'desc');

    // Filter by action
    if (action) {
      query = query.where('audit_logs.action', action);
    }

    // Filter by entity type
    if (entity_type) {
      query = query.where('audit_logs.entity_type', entity_type);
    }

    // Filter by user
    if (user_id) {
      query = query.where('audit_logs.user_id', user_id);
    }

    // Filter by date range
    if (start_date) {
      query = query.where('audit_logs.timestamp', '>=', new Date(start_date));
    }
    if (end_date) {
      query = query.where('audit_logs.timestamp', '<=', new Date(end_date + 'T23:59:59'));
    }

    const logs = await query
      .limit(limit)
      .offset(offset);

    const total = await db('audit_logs')
      .where('school_id', schoolId)
      .modify(function(q) {
        if (action) q.where('action', action);
        if (entity_type) q.where('entity_type', entity_type);
        if (user_id) q.where('user_id', user_id);
        if (start_date) q.where('timestamp', '>=', new Date(start_date));
        if (end_date) q.where('timestamp', '<=', new Date(end_date + 'T23:59:59'));
      })
      .count('* as count')
      .first();

    res.json({
      success: true,
      data: logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(total.count),
        totalPages: Math.ceil(total.count / limit)
      }
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch audit logs' });
  }
};

/**
 * Get audit log by ID
 */
const getAuditLogById = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.user.school_id;

    const log = await db('audit_logs')
      .select(
        'audit_logs.*',
        'users.first_name',
        'users.last_name',
        'users.email'
      )
      .leftJoin('users', 'audit_logs.user_id', 'users.id')
      .where('audit_logs.id', id)
      .where('audit_logs.school_id', schoolId)
      .first();

    if (!log) {
      return res.status(404).json({ success: false, error: 'Audit log not found' });
    }

    res.json({ success: true, data: log });
  } catch (error) {
    console.error('Get audit log error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch audit log' });
  }
};

/**
 * Get audit statistics
 */
const getAuditStats = async (req, res) => {
  try {
    const schoolId = req.user.school_id;

    // Get action counts
    const actionCounts = await db('audit_logs')
      .select('action')
      .count('* as count')
      .where('school_id', schoolId)
      .where('timestamp', '>=', db.raw("NOW() - INTERVAL '30 days'"))
      .groupBy('action')
      .orderBy('count', 'desc');

    // Get entity type counts
    const entityCounts = await db('audit_logs')
      .select('entity_type')
      .count('* as count')
      .where('school_id', schoolId)
      .where('timestamp', '>=', db.raw("NOW() - INTERVAL '30 days'"))
      .whereNotNull('entity_type')
      .groupBy('entity_type')
      .orderBy('count', 'desc');

    // Get top users
    const topUsers = await db('audit_logs')
      .select(
        'users.first_name',
        'users.last_name',
        'users.email'
      )
      .count('* as count')
      .leftJoin('users', 'audit_logs.user_id', 'users.id')
      .where('audit_logs.school_id', schoolId)
      .where('audit_logs.timestamp', '>=', db.raw("NOW() - INTERVAL '30 days'"))
      .groupBy('users.id', 'users.first_name', 'users.last_name', 'users.email')
      .orderBy('count', 'desc')
      .limit(10);

    res.json({
      success: true,
      data: {
        actionCounts,
        entityCounts,
        topUsers
      }
    });
  } catch (error) {
    console.error('Get audit stats error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch audit statistics' });
  }
};

module.exports = {
  getAuditLogs,
  getAuditLogById,
  getAuditStats
};
