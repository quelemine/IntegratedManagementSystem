const express = require('express');
const router = express.Router();
const {
  getAdminAnalytics,
  getTeacherAnalytics,
  getStudentAnalytics,
  getParentAnalytics
} = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// GET /api/dashboard/admin - Get admin dashboard analytics
router.get('/admin', getAdminAnalytics);

// GET /api/dashboard/teacher - Get teacher dashboard analytics
router.get('/teacher', getTeacherAnalytics);

// GET /api/dashboard/student - Get student dashboard analytics
router.get('/student', getStudentAnalytics);

// GET /api/dashboard/parent - Get parent dashboard analytics
router.get('/parent', getParentAnalytics);

module.exports = router;
