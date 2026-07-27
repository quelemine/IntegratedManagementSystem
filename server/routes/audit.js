const express = require('express');
const router = express.Router();
const {
  getAuditLogs,
  getAuditLogById,
  getAuditStats
} = require('../controllers/auditController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorization');

// All routes require authentication and admin authorization
router.use(authenticate);
router.use(authorize(['super_admin', 'admin', 'principal']));

// GET /api/audit/logs - Get all audit logs with filtering
router.get('/logs', getAuditLogs);

// GET /api/audit/logs/:id - Get a specific audit log
router.get('/logs/:id', getAuditLogById);

// GET /api/audit/stats - Get audit statistics
router.get('/stats', getAuditStats);

module.exports = router;
