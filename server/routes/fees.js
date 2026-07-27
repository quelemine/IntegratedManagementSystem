const express = require('express');
const router = express.Router();
const feeController = require('../controllers/feeController');
const { authenticate } = require('../middleware/auth');

/**
 * @swagger
 * /api/fees/seed:
 *   post:
 *     summary: Seed financial data
 *     tags: [Fees]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Financial data seeded successfully
 */
router.post('/seed', authenticate, feeController.seedFinancialData);

/**
 * @swagger
 * /api/fees/categories:
 *   get:
 *     summary: Get all fee categories
 *     tags: [Fees]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Fee categories retrieved successfully
 */
router.get('/categories', authenticate, feeController.getFeeCategories);

/**
 * @swagger
 * /api/fees/categories:
 *   post:
 *     summary: Create fee category
 *     tags: [Fees]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Fee category created successfully
 */
router.post('/categories', authenticate, feeController.createFeeCategory);

/**
 * @swagger
 * /api/fees/tuition-structures:
 *   get:
 *     summary: Get all tuition structures
 *     tags: [Fees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: grade_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: academic_year
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tuition structures retrieved successfully
 */
router.get('/tuition-structures', authenticate, feeController.getTuitionStructures);

/**
 * @swagger
 * /api/fees/tuition-structures:
 *   post:
 *     summary: Create tuition structure
 *     tags: [Fees]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               grade_id:
 *                 type: string
 *               name:
 *                 type: string
 *               amount:
 *                 type: number
 *               currency:
 *                 type: string
 *               academic_year:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tuition structure created successfully
 */
router.post('/tuition-structures', authenticate, feeController.createTuitionStructure);

/**
 * @swagger
 * /api/fees/class-fees:
 *   get:
 *     summary: Get all class fees
 *     tags: [Fees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: class_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: academic_year
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Class fees retrieved successfully
 */
router.get('/class-fees', authenticate, feeController.getClassFees);

/**
 * @swagger
 * /api/fees/class-fees:
 *   post:
 *     summary: Create class fee
 *     tags: [Fees]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               class_id:
 *                 type: string
 *               fee_category_id:
 *                 type: string
 *               amount:
 *                 type: number
 *               currency:
 *                 type: string
 *               academic_year:
 *                 type: string
 *     responses:
 *       201:
 *         description: Class fee created successfully
 */
router.post('/class-fees', authenticate, feeController.createClassFee);

/**
 * @swagger
 * /api/fees/discounts:
 *   get:
 *     summary: Get all discounts
 *     tags: [Fees]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Discounts retrieved successfully
 */
router.get('/discounts', authenticate, feeController.getDiscounts);

/**
 * @swagger
 * /api/fees/discounts:
 *   post:
 *     summary: Create discount
 *     tags: [Fees]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               discount_type:
 *                 type: string
 *               discount_value:
 *                 type: number
 *               applicable_to:
 *                 type: string
 *               start_date:
 *                 type: string
 *                 format: date
 *               end_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Discount created successfully
 */
router.post('/discounts', authenticate, feeController.createDiscount);

/**
 * @swagger
 * /api/fees/scholarships:
 *   get:
 *     summary: Get all scholarships
 *     tags: [Fees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: academic_year
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Scholarships retrieved successfully
 */
router.get('/scholarships', authenticate, feeController.getScholarships);

/**
 * @swagger
 * /api/fees/scholarships:
 *   post:
 *     summary: Create scholarship
 *     tags: [Fees]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               scholarship_type:
 *                 type: string
 *               coverage_percentage:
 *                 type: number
 *               max_amount:
 *                 type: number
 *               academic_year:
 *                 type: string
 *     responses:
 *       201:
 *         description: Scholarship created successfully
 */
router.post('/scholarships', authenticate, feeController.createScholarship);

module.exports = router;
