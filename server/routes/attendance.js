const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { authenticate } = require('../middleware/auth');
const { authorize, schoolScope } = require('../middleware/authorization');
const { validate, validationRules } = require('../middleware/validation');
const { auditLog } = require('../middleware/audit');

/**
 * @swagger
 * /api/attendance:
 *   get:
 *     summary: Get attendance by class and date
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: class_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by class
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by date
 *     responses:
 *       200:
 *         description: Attendance retrieved successfully
 */
router.get('/', authenticate, schoolScope, attendanceController.getClassAttendance);

/**
 * @swagger
 * /api/attendance/student/{student_id}:
 *   get:
 *     summary: Get attendance by student
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: student_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Student attendance retrieved successfully
 */
router.get('/student/:student_id', authenticate, schoolScope, validationRules.uuidParam, validate, attendanceController.getStudentAttendance);

/**
 * @swagger
 * /api/attendance:
 *   post:
 *     summary: Create attendance record
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - student_id
 *               - class_id
 *               - date
 *               - status
 *             properties:
 *               student_id:
 *                 type: string
 *                 format: uuid
 *               class_id:
 *                 type: string
 *                 format: uuid
 *               date:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [present, absent, late, excused]
 *               remarks:
 *                 type: string
 *     responses:
 *       201:
 *         description: Attendance created successfully
 *       400:
 *         description: Attendance already exists
 */
router.post('/', authenticate, authorize(['super_admin', 'principal', 'teacher']), auditLog('create'), attendanceController.createAttendance);

/**
 * @swagger
 * /api/attendance/{id}:
 *   put:
 *     summary: Update attendance record
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [present, absent, late, excused]
 *               remarks:
 *                 type: string
 *     responses:
 *       200:
 *         description: Attendance updated successfully
 *       404:
 *         description: Attendance not found
 */
router.put('/:id', authenticate, authorize(['super_admin', 'principal', 'teacher']), schoolScope, validationRules.uuidParam, validate, auditLog('update'), attendanceController.updateAttendance);

/**
 * @swagger
 * /api/attendance/{id}:
 *   delete:
 *     summary: Delete attendance record
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Attendance deleted successfully
 *       404:
 *         description: Attendance not found
 */
router.delete('/:id', authenticate, authorize(['super_admin', 'principal']), schoolScope, validationRules.uuidParam, validate, auditLog('delete'), attendanceController.deleteAttendance);

/**
 * @swagger
 * /api/attendance/report:
 *   get:
 *     summary: Generate attendance report
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: class_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by class
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for report
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for report
 *     responses:
 *       200:
 *         description: Attendance report generated successfully
 */
router.get('/report', authenticate, schoolScope, attendanceController.generateAttendanceReport);

/**
 * @swagger
 * /api/attendance/bulk:
 *   post:
 *     summary: Bulk create attendance records for a class
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - class_id
 *               - date
 *               - attendance_records
 *             properties:
 *               class_id:
 *                 type: string
 *                 format: uuid
 *               date:
 *                 type: string
 *                 format: date
 *               attendance_records:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     student_id:
 *                       type: string
 *                       format: uuid
 *                     status:
 *                       type: string
 *                       enum: [present, absent, late, excused]
 *                     remarks:
 *                       type: string
 *     responses:
 *       201:
 *         description: Attendance records created successfully
 */
router.post('/bulk', authenticate, authorize(['super_admin', 'principal', 'teacher']), attendanceController.bulkCreateAttendance);

/**
 * @swagger
 * /api/attendance/statistics:
 *   get:
 *     summary: Get attendance statistics
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for statistics
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for statistics
 *       - in: query
 *         name: class_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by class
 *     responses:
 *       200:
 *         description: Attendance statistics retrieved successfully
 */
router.get('/statistics', authenticate, authorize(['super_admin', 'admin', 'principal']), schoolScope, attendanceController.getAttendanceStatistics);

/**
 * @swagger
 * /api/attendance/calendar/:student_id:
 *   get:
 *     summary: Get attendance calendar for a student
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: student_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: month
 *         schema:
 *           type: string
 *         description: Month (1-12)
 *       - in: query
 *         name: year
 *         schema:
 *           type: string
 *         description: Year (YYYY)
 *     responses:
 *       200:
 *         description: Attendance calendar retrieved successfully
 */
router.get('/calendar/:student_id', authenticate, schoolScope, validationRules.uuidParam, validate, attendanceController.getStudentAttendanceCalendar);

module.exports = router;
