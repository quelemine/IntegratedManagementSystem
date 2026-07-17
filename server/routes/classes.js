const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');
const { authenticate } = require('../middleware/auth');
const { authorize, schoolScope } = require('../middleware/authorization');
const { validate, validationRules } = require('../middleware/validation');
const { auditLog } = require('../middleware/audit');

/**
 * @swagger
 * /api/classes:
 *   get:
 *     summary: Get all classes (school-scoped)
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: grade_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by grade
 *       - in: query
 *         name: academic_year
 *         schema:
 *           type: string
 *         description: Filter by academic year
 *     responses:
 *       200:
 *         description: Classes retrieved successfully
 */
router.get('/', authenticate, schoolScope, classController.getClasses);

/**
 * @swagger
 * /api/classes:
 *   post:
 *     summary: Create a new class (Super Admin/Principal only)
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - grade_id
 *               - name
 *             properties:
 *               grade_id:
 *                 type: string
 *                 format: uuid
 *               name:
 *                 type: string
 *               homeroom_teacher_id:
 *                 type: string
 *                 format: uuid
 *               capacity:
 *                 type: integer
 *               academic_year:
 *                 type: string
 *     responses:
 *       201:
 *         description: Class created successfully
 *       403:
 *         description: Insufficient permissions
 */
router.post('/', authenticate, authorize(['super_admin', 'principal']), auditLog('create'), classController.createClass);

/**
 * @swagger
 * /api/classes/{id}:
 *   get:
 *     summary: Get class by ID
 *     tags: [Classes]
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
 *         description: Class retrieved successfully
 *       404:
 *         description: Class not found
 */
router.get('/:id', authenticate, schoolScope, validationRules.uuidParam, validate, classController.getClassById);

/**
 * @swagger
 * /api/classes/{id}:
 *   put:
 *     summary: Update class
 *     tags: [Classes]
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
 *               name:
 *                 type: string
 *               homeroom_teacher_id:
 *                 type: string
 *                 format: uuid
 *               capacity:
 *                 type: integer
 *               academic_year:
 *                 type: string
 *     responses:
 *       200:
 *         description: Class updated successfully
 *       404:
 *         description: Class not found
 */
router.put('/:id', authenticate, authorize(['super_admin', 'principal']), schoolScope, validationRules.uuidParam, validate, auditLog('update'), classController.updateClass);

/**
 * @swagger
 * /api/classes/{id}:
 *   delete:
 *     summary: Delete class (Super Admin only)
 *     tags: [Classes]
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
 *         description: Class deleted successfully
 *       403:
 *         description: Insufficient permissions
 *       400:
 *         description: Cannot delete class with existing students
 */
router.delete('/:id', authenticate, authorize(['super_admin']), schoolScope, validationRules.uuidParam, validate, auditLog('delete'), classController.deleteClass);

/**
 * @swagger
 * /api/classes/{id}/students:
 *   get:
 *     summary: Get students in a class
 *     tags: [Classes]
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
 *         description: Class students retrieved successfully
 *       404:
 *         description: Class not found
 */
router.get('/:id/students', authenticate, schoolScope, validationRules.uuidParam, validate, classController.getClassStudents);

module.exports = router;
