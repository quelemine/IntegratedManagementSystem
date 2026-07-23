const express = require('express');
const router = express.Router();
const studentGradeController = require('../controllers/studentGradeController');
const { authenticate } = require('../middleware/auth');
const { authorize, schoolScope } = require('../middleware/authorization');
const { validate, validationRules } = require('../middleware/validation');
const { auditLog } = require('../middleware/audit');

/**
 * @swagger
 * /api/student-grades:
 *   get:
 *     summary: Get student grades
 *     tags: [Student Grades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: student_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by student
 *       - in: query
 *         name: course_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by course
 *       - in: query
 *         name: term
 *         schema:
 *           type: string
 *         description: Filter by term
 *       - in: query
 *         name: academic_year
 *         schema:
 *           type: string
 *         description: Filter by academic year
 *     responses:
 *       200:
 *         description: Student grades retrieved successfully
 */
router.get('/', authenticate, schoolScope, studentGradeController.getStudentGrades);

/**
 * @swagger
 * /api/student-grades:
 *   post:
 *     summary: Create student grade
 *     tags: [Student Grades]
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
 *               - course_id
 *               - grade_type
 *             properties:
 *               student_id:
 *                 type: string
 *                 format: uuid
 *               course_id:
 *                 type: string
 *                 format: uuid
 *               assignment_id:
 *                 type: string
 *                 format: uuid
 *               quiz_id:
 *                 type: string
 *                 format: uuid
 *               grade_type:
 *                 type: string
 *                 enum: [assignment, quiz, exam, project]
 *               score:
 *                 type: number
 *               total_points:
 *                 type: integer
 *               letter_grade:
 *                 type: string
 *               remarks:
 *                 type: string
 *               term:
 *                 type: string
 *               academic_year:
 *                 type: string
 *     responses:
 *       201:
 *         description: Student grade created successfully
 */
router.post('/', authenticate, authorize(['super_admin', 'principal', 'teacher']), auditLog('create'), studentGradeController.createStudentGrade);

/**
 * @swagger
 * /api/student-grades/{id}:
 *   put:
 *     summary: Update student grade
 *     tags: [Student Grades]
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
 *               score:
 *                 type: number
 *               total_points:
 *                 type: integer
 *               letter_grade:
 *                 type: string
 *               remarks:
 *                 type: string
 *     responses:
 *       200:
 *         description: Student grade updated successfully
 *       404:
 *         description: Student grade not found
 */
router.put('/:id', authenticate, authorize(['super_admin', 'principal', 'teacher']), schoolScope, validationRules.uuidParam, validate, auditLog('update'), studentGradeController.updateStudentGrade);

/**
 * @swagger
 * /api/student-grades/{id}:
 *   delete:
 *     summary: Delete student grade
 *     tags: [Student Grades]
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
 *         description: Student grade deleted successfully
 *       404:
 *         description: Student grade not found
 */
router.delete('/:id', authenticate, authorize(['super_admin', 'principal']), schoolScope, validationRules.uuidParam, validate, auditLog('delete'), studentGradeController.deleteStudentGrade);

/**
 * @swagger
 * /api/student-grades/report:
 *   get:
 *     summary: Generate student grade report
 *     tags: [Student Grades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: student_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by student
 *       - in: query
 *         name: term
 *         schema:
 *           type: string
 *         description: Filter by term
 *       - in: query
 *         name: academic_year
 *         schema:
 *           type: string
 *         description: Filter by academic year
 *     responses:
 *       200:
 *         description: Grade report generated successfully
 */
router.get('/report', authenticate, schoolScope, studentGradeController.generateGradeReport);

module.exports = router;
