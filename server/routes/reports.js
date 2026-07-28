const express = require('express');
const router = express.Router();
const {
  getStudentAcademicReport,
  getStudentAttendanceReport,
  getStudentFeeStatement,
  getClassPerformanceReport,
  getEnrollmentReport,
  getFinancialReport,
  getAttendanceReport
} = require('../controllers/reportController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorization');

// All routes require authentication
router.use(authenticate);

// Student Reports
router.get('/student/:student_id/academic', getStudentAcademicReport);
router.get('/student/:student_id/attendance', getStudentAttendanceReport);
router.get('/student/:student_id/fees', getStudentFeeStatement);

// Teacher Reports
router.get('/class/:class_id/performance', authorize(['super_admin', 'principal', 'teacher']), getClassPerformanceReport);

// Admin Reports
router.get('/enrollment', authorize(['super_admin', 'admin', 'principal']), getEnrollmentReport);
router.get('/financial', authorize(['super_admin', 'admin', 'principal']), getFinancialReport);
router.get('/attendance', authorize(['super_admin', 'admin', 'principal']), getAttendanceReport);

module.exports = router;
