const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const { authenticate } = require('../middleware/auth');
const { authorize, schoolScope } = require('../middleware/authorization');
const { validate, validationRules } = require('../middleware/validation');
const { auditLog } = require('../middleware/audit');

/**
 * @swagger
 * /api/assignments:
 *   get:
 *     summary: Get all assignments
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: course_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by course
 *       - in: query
 *         name: teacher_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by teacher
 *       - in: query
 *         name: class_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by class
 *     responses:
 *       200:
 *         description: Assignments retrieved successfully
 */
router.get('/', authenticate, schoolScope, assignmentController.getAssignments);

/**
 * @swagger
 * /api/assignments/{id}:
 *   get:
 *     summary: Get assignment by ID
 *     tags: [Assignments]
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
 *         description: Assignment retrieved successfully
 *       404:
 *         description: Assignment not found
 */
router.get('/:id', authenticate, schoolScope, validationRules.uuidParam, validate, assignmentController.getAssignmentById);

/**
 * @swagger
 * /api/assignments:
 *   post:
 *     summary: Create assignment
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - course_id
 *               - title
 *             properties:
 *               course_id:
 *                 type: string
 *                 format: uuid
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               due_date:
 *                 type: string
 *                 format: date-time
 *               total_points:
 *                 type: integer
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Assignment created successfully
 */
router.post('/', authenticate, authorize(['super_admin', 'principal', 'teacher']), auditLog('create'), assignmentController.createAssignment);

/**
 * @swagger
 * /api/assignments/{id}:
 *   put:
 *     summary: Update assignment
 *     tags: [Assignments]
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
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               due_date:
 *                 type: string
 *                 format: date-time
 *               total_points:
 *                 type: integer
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Assignment updated successfully
 *       404:
 *         description: Assignment not found
 */
router.put('/:id', authenticate, authorize(['super_admin', 'principal', 'teacher']), schoolScope, validationRules.uuidParam, validate, auditLog('update'), assignmentController.updateAssignment);

/**
 * @swagger
 * /api/assignments/{id}:
 *   delete:
 *     summary: Delete assignment
 *     tags: [Assignments]
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
 *         description: Assignment deleted successfully
 *       404:
 *         description: Assignment not found
 */
router.delete('/:id', authenticate, authorize(['super_admin', 'principal']), schoolScope, validationRules.uuidParam, validate, auditLog('delete'), assignmentController.deleteAssignment);

module.exports = router;
