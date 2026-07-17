const express = require('express');
const router = express.Router();
const gradeController = require('../controllers/gradeController');
const { authenticate } = require('../middleware/auth');
const { authorize, schoolScope } = require('../middleware/authorization');
const { validate, validationRules } = require('../middleware/validation');
const { auditLog } = require('../middleware/audit');

/**
 * @swagger
 * /api/grades:
 *   get:
 *     summary: Get all grades (school-scoped)
 *     tags: [Grades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: division_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by division
 *     responses:
 *       200:
 *         description: Grades retrieved successfully
 */
router.get('/', authenticate, schoolScope, gradeController.getGrades);

/**
 * @swagger
 * /api/grades:
 *   post:
 *     summary: Create a new grade (Super Admin/Principal only)
 *     tags: [Grades]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - division_id
 *               - name
 *               - code
 *             properties:
 *               division_id:
 *                 type: string
 *                 format: uuid
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               order:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Grade created successfully
 *       403:
 *         description: Insufficient permissions
 */
router.post('/', authenticate, authorize(['super_admin', 'principal']), auditLog('create'), gradeController.createGrade);

/**
 * @swagger
 * /api/grades/{id}:
 *   get:
 *     summary: Get grade by ID
 *     tags: [Grades]
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
 *         description: Grade retrieved successfully
 *       404:
 *         description: Grade not found
 */
router.get('/:id', authenticate, schoolScope, validationRules.uuidParam, validate, gradeController.getGradeById);

/**
 * @swagger
 * /api/grades/{id}:
 *   put:
 *     summary: Update grade
 *     tags: [Grades]
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
 *               order:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Grade updated successfully
 *       404:
 *         description: Grade not found
 */
router.put('/:id', authenticate, authorize(['super_admin', 'principal']), schoolScope, validationRules.uuidParam, validate, auditLog('update'), gradeController.updateGrade);

/**
 * @swagger
 * /api/grades/{id}:
 *   delete:
 *     summary: Delete grade (Super Admin only)
 *     tags: [Grades]
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
 *         description: Grade deleted successfully
 *       403:
 *         description: Insufficient permissions
 *       400:
 *         description: Cannot delete grade with existing classes
 */
router.delete('/:id', authenticate, authorize(['super_admin']), schoolScope, validationRules.uuidParam, validate, auditLog('delete'), gradeController.deleteGrade);

module.exports = router;
