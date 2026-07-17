const express = require('express');
const router = express.Router();
const schoolController = require('../controllers/schoolController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorization');
const { validate, validationRules } = require('../middleware/validation');
const { auditLog } = require('../middleware/audit');

/**
 * @swagger
 * /api/schools:
 *   get:
 *     summary: Get all schools (Super Admin only)
 *     tags: [Schools]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Schools retrieved successfully
 *       403:
 *         description: Insufficient permissions
 */
router.get('/', authenticate, authorize(['super_admin']), schoolController.getSchools);

/**
 * @swagger
 * /api/schools/my-school:
 *   get:
 *     summary: Get current user's school
 *     tags: [Schools]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: School retrieved successfully
 */
router.get('/my-school', authenticate, schoolController.getMySchool);

/**
 * @swagger
 * /api/schools:
 *   post:
 *     summary: Create a new school (Super Admin only)
 *     tags: [Schools]
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
 *             properties:
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               address:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               logo_url:
 *                 type: string
 *               primary_color:
 *                 type: string
 *               secondary_color:
 *                 type: string
 *               accent_color:
 *                 type: string
 *               settings:
 *                 type: object
 *     responses:
 *       201:
 *         description: School created successfully
 *       403:
 *         description: Insufficient permissions
 */
router.post('/', authenticate, authorize(['super_admin']), auditLog('create'), schoolController.createSchool);

/**
 * @swagger
 * /api/schools/{id}:
 *   get:
 *     summary: Get school by ID
 *     tags: [Schools]
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
 *         description: School retrieved successfully
 *       404:
 *         description: School not found
 */
router.get('/:id', authenticate, validationRules.uuidParam, validate, schoolController.getSchoolById);

/**
 * @swagger
 * /api/schools/{id}:
 *   put:
 *     summary: Update school
 *     tags: [Schools]
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
 *               address:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               logo_url:
 *                 type: string
 *               primary_color:
 *                 type: string
 *               secondary_color:
 *                 type: string
 *               accent_color:
 *                 type: string
 *               settings:
 *                 type: object
 *     responses:
 *       200:
 *         description: School updated successfully
 *       404:
 *         description: School not found
 */
router.put('/:id', authenticate, authorize(['super_admin']), validationRules.uuidParam, validate, auditLog('update'), schoolController.updateSchool);

/**
 * @swagger
 * /api/schools/{id}/branding:
 *   put:
 *     summary: Update school branding
 *     tags: [Schools]
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
 *               primary_color:
 *                 type: string
 *               secondary_color:
 *                 type: string
 *               accent_color:
 *                 type: string
 *               logo_url:
 *                 type: string
 *     responses:
 *       200:
 *         description: School branding updated successfully
 */
router.put('/:id/branding', authenticate, authorize(['super_admin']), validationRules.uuidParam, validate, auditLog('update'), schoolController.updateSchoolBranding);

/**
 * @swagger
 * /api/schools/{id}:
 *   delete:
 *     summary: Delete school (Super Admin only)
 *     tags: [Schools]
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
 *         description: School deleted successfully
 *       403:
 *         description: Insufficient permissions
 *       400:
 *         description: Cannot delete school with existing users
 */
router.delete('/:id', authenticate, authorize(['super_admin']), validationRules.uuidParam, validate, auditLog('delete'), schoolController.deleteSchool);

module.exports = router;
