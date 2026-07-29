const express = require('express');
const router = express.Router();
const financialReportController = require('../controllers/financialReportController');
const { authenticate } = require('../middleware/auth');

/**
 * @swagger
 * /api/reports/student-balances:
 *   get:
 *     summary: Get student balances report
 *     tags: [Financial Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: academic_year
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Student balances report retrieved successfully
 */
router.get('/student-balances', authenticate, financialReportController.getStudentBalances);

/**
 * @swagger
 * /api/reports/daily-payments:
 *   get:
 *     summary: Get daily payments report
 *     tags: [Financial Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Daily payments report retrieved successfully
 */
router.get('/daily-payments', authenticate, financialReportController.getDailyPayments);

/**
 * @swagger
 * /api/reports/monthly-revenue:
 *   get:
 *     summary: Get monthly revenue report
 *     tags: [Financial Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Monthly revenue report retrieved successfully
 */
router.get('/monthly-revenue', authenticate, financialReportController.getMonthlyRevenue);

/**
 * @swagger
 * /api/reports/outstanding-fees:
 *   get:
 *     summary: Get outstanding fees report
 *     tags: [Financial Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: academic_year
 *         schema:
 *           type: string
 *       - in: query
 *         name: fee_type
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Outstanding fees report retrieved successfully
 */
router.get('/outstanding-fees', authenticate, financialReportController.getOutstandingFees);

/**
 * @swagger
 * /api/reports/payment-history:
 *   get:
 *     summary: Get payment history report
 *     tags: [Financial Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: student_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: payment_method
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment history report retrieved successfully
 */
router.get('/payment-history', authenticate, financialReportController.getPaymentHistory);

/**
 * @swagger
 * /api/reports/summary:
 *   get:
 *     summary: Get financial summary dashboard (alias for /financial-summary)
 *     tags: [Financial Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Financial summary retrieved successfully
 */
router.get('/summary', authenticate, financialReportController.getFinancialSummary);

/**
 * @swagger
 * /api/reports/financial-summary:
 *   get:
 *     summary: Get financial summary dashboard
 *     tags: [Financial Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: academic_year
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Financial summary retrieved successfully
 */
router.get('/financial-summary', authenticate, financialReportController.getFinancialSummary);

module.exports = router;
