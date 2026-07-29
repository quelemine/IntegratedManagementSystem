const express = require('express');
const router = express.Router();
const reportCardController = require('../controllers/reportCardController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorization');

/**
 * @swagger
 * /api/report-cards/student/{studentId}:
 *   get:
 *     summary: Get report card for a student
 *     tags: [Report Cards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: academicYear
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Report card retrieved successfully
 *       403:
 *         description: Access denied or outstanding fees
 */
router.get('/student/:studentId', authenticate, reportCardController.getReportCard);

/**
 * @swagger
 * /api/report-cards/my-children:
 *   get:
 *     summary: Get report cards for parent's children
 *     tags: [Report Cards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: academicYear
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Report cards retrieved successfully
 */
router.get('/my-children', authenticate, authorize(['parent']), reportCardController.getParentChildrenReportCards);

module.exports = router;
