const express = require('express');
const router = express.Router();
const {
  getStudentProgress,
  getSubjectPerformance,
  updateAcademicProgress,
  updateSubjectPerformance,
  getClassPerformance,
  getSchoolReports,
  getTopStudents,
  getStudentsNeedingAttention,
  getAcademicHistory
} = require('../controllers/academicProgressController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorization');

// All routes require authentication
router.use(authenticate);

// Student routes
router.get('/student/:studentId', getStudentProgress);
router.get('/student/:studentId/subjects', getSubjectPerformance);
router.get('/student/:studentId/history', getAcademicHistory);

// Teacher routes
router.get('/class/:classId', authorize(['teacher', 'admin', 'super_admin', 'principal']), getClassPerformance);
router.put('/student/:studentId', authorize(['teacher', 'admin', 'super_admin', 'principal']), updateAcademicProgress);
router.put('/subject/:academicProgressId', authorize(['teacher', 'admin', 'super_admin', 'principal']), updateSubjectPerformance);

// Admin routes
router.get('/school/reports', authorize(['admin', 'super_admin', 'principal']), getSchoolReports);
router.get('/school/top-students', authorize(['admin', 'super_admin', 'principal']), getTopStudents);
router.get('/school/needs-attention', authorize(['admin', 'super_admin', 'principal']), getStudentsNeedingAttention);

module.exports = router;
