const express = require('express');
const router = express.Router();
const parentController = require('../controllers/parentController');
const { authenticate } = require('../middleware/auth');
const { schoolScope } = require('../middleware/authorization');
const { validate, validationRules } = require('../middleware/validation');

/**
 * @swagger
 * /api/parents:
 *   get:
 *     summary: Get all parents
 *     tags: [Parents]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Parents retrieved successfully
 */
router.get('/', authenticate, schoolScope, parentController.getParents);

/**
 * @swagger
 * /api/parents/{id}:
 *   get:
 *     summary: Get parent by ID
 *     tags: [Parents]
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
 *         description: Parent retrieved successfully
 */
router.get('/:id', authenticate, schoolScope, validationRules.uuidParam, validate, parentController.getParentById);

/**
 * @swagger
 * /api/parents:
 *   post:
 *     summary: Create parent record
 *     tags: [Parents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *             properties:
 *               user_id:
 *                 type: string
 *                 format: uuid
 *               relationship:
 *                 type: string
 *               occupation:
 *                 type: string
 *               employer:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       201:
 *         description: Parent created successfully
 */
router.post('/', authenticate, schoolScope, parentController.createParent);

/**
 * @swagger
 * /api/parents/{id}:
 *   put:
 *     summary: Update parent
 *     tags: [Parents]
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
 *               relationship:
 *                 type: string
 *               occupation:
 *                 type: string
 *               employer:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Parent updated successfully
 */
router.put('/:id', authenticate, schoolScope, validationRules.uuidParam, validate, parentController.updateParent);

/**
 * @swagger
 * /api/parents/{id}:
 *   delete:
 *     summary: Delete parent
 *     tags: [Parents]
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
 *         description: Parent deleted successfully
 */
router.delete('/:id', authenticate, schoolScope, validationRules.uuidParam, validate, parentController.deleteParent);

module.exports = router;
