const express = require('express');
const router = express.Router();
const divisionController = require('../controllers/divisionController');
const { authenticate } = require('../middleware/auth');
const { authorize, schoolScope } = require('../middleware/authorization');
const { validate, validationRules } = require('../middleware/validation');
const { auditLog } = require('../middleware/audit');

/**
 * @swagger
 * /api/divisions:
 *   get:
 *     summary: Get all divisions (school-scoped)
 *     tags: [Divisions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Divisions retrieved successfully
 */
router.get('/', authenticate, schoolScope, divisionController.getDivisions);

/**
 * @swagger
 * /api/divisions:
 *   post:
 *     summary: Create a new division (Super Admin/Principal only)
 *     tags: [Divisions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - code
 *               - level
 *             properties:
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               level:
 *                 type: string
 *               principal_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Division created successfully
 *       403:
 *         description: Insufficient permissions
 */
router.post('/', authenticate, authorize(['super_admin', 'principal']), auditLog('create'), divisionController.createDivision);

/**
 * @swagger
 * /api/divisions/{id}:
 *   get:
 *     summary: Get division by ID
 *     tags: [Divisions]
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
 *         description: Division retrieved successfully
 *       404:
 *         description: Division not found
 */
router.get('/:id', authenticate, schoolScope, validationRules.uuidParam, validate, divisionController.getDivisionById);

/**
 * @swagger
 * /api/divisions/{id}:
 *   put:
 *     summary: Update division
 *     tags: [Divisions]
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
 *               principal_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Division updated successfully
 *       404:
 *         description: Division not found
 */
router.put('/:id', authenticate, authorize(['super_admin', 'principal']), schoolScope, validationRules.uuidParam, validate, auditLog('update'), divisionController.updateDivision);

/**
 * @swagger
 * /api/divisions/{id}:
 *   delete:
 *     summary: Delete division (Super Admin only)
 *     tags: [Divisions]
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
 *         description: Division deleted successfully
 *       403:
 *         description: Insufficient permissions
 *       400:
 *         description: Cannot delete division with existing grades
 */
router.delete('/:id', authenticate, authorize(['super_admin']), schoolScope, validationRules.uuidParam, validate, auditLog('delete'), divisionController.deleteDivision);

module.exports = router;
