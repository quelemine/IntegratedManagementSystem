const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { authenticate } = require('../middleware/auth');

/**
 * @swagger
 * /api/invoices:
 *   get:
 *     summary: Get all invoices
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: student_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: academic_year
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invoices retrieved successfully
 */
router.get('/', authenticate, invoiceController.getInvoices);

/**
 * @swagger
 * /api/invoices/overdue:
 *   get:
 *     summary: Get overdue invoices
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Overdue invoices retrieved successfully
 */
router.get('/overdue', authenticate, invoiceController.getOverdueInvoices);

/**
 * @swagger
 * /api/invoices:
 *   post:
 *     summary: Create invoice
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               student_id:
 *                 type: string
 *               academic_year:
 *                 type: string
 *               fee_assignment_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *               due_date:
 *                 type: string
 *                 format: date
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Invoice created successfully
 */
router.post('/', authenticate, invoiceController.createInvoice);

/**
 * @swagger
 * /api/invoices/{id}:
 *   get:
 *     summary: Get invoice by ID
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invoice retrieved successfully
 */
router.get('/:id', authenticate, invoiceController.getInvoiceById);

/**
 * @swagger
 * /api/invoices/{id}:
 *   put:
 *     summary: Update invoice
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Invoice updated successfully
 */
router.put('/:id', authenticate, invoiceController.updateInvoice);

/**
 * @swagger
 * /api/invoices/{id}:
 *   delete:
 *     summary: Delete invoice
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invoice deleted successfully
 */
router.delete('/:id', authenticate, invoiceController.deleteInvoice);

/**
 * @swagger
 * /api/invoices/{id}/status:
 *   put:
 *     summary: Update invoice status
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invoice status updated successfully
 */
router.put('/:id/status', authenticate, invoiceController.updateInvoiceStatus);

module.exports = router;
