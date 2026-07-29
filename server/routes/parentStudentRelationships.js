const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorization');
const parentStudentRelationshipController = require('../controllers/parentStudentRelationshipController');

/**
 * @swagger
 * /api/parent-student-relationships:
 *   get:
 *     summary: Get all parent-student relationships
 *     tags: [Parent-Student Relationships]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: parent_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: student_id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Relationships retrieved successfully
 */
router.get('/', authenticate, authorize(['super_admin', 'principal']), parentStudentRelationshipController.getRelationships);

/**
 * @swagger
 * /api/parent-student-relationships:
 *   post:
 *     summary: Create a parent-student relationship
 *     tags: [Parent-Student Relationships]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               parent_id:
 *                 type: string
 *               student_id:
 *                 type: string
 *               relationship_type:
 *                 type: string
 *                 enum: [father, mother, guardian, other]
 *               is_primary:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Relationship created successfully
 */
router.post('/', authenticate, authorize(['super_admin', 'principal']), parentStudentRelationshipController.createRelationship);

/**
 * @swagger
 * /api/parent-student-relationships/{id}:
 *   put:
 *     summary: Update a parent-student relationship
 *     tags: [Parent-Student Relationships]
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
 *               relationship_type:
 *                 type: string
 *                 enum: [father, mother, guardian, other]
 *               is_primary:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Relationship updated successfully
 */
router.put('/:id', authenticate, authorize(['super_admin', 'principal']), parentStudentRelationshipController.updateRelationship);

/**
 * @swagger
 * /api/parent-student-relationships/{id}:
 *   delete:
 *     summary: Delete a parent-student relationship
 *     tags: [Parent-Student Relationships]
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
 *         description: Relationship deleted successfully
 */
router.delete('/:id', authenticate, authorize(['super_admin', 'principal']), parentStudentRelationshipController.deleteRelationship);

/**
 * @swagger
 * /api/parent-student-relationships/my-children:
 *   get:
 *     summary: Get logged-in parent's children
 *     tags: [Parent-Student Relationships]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Children retrieved successfully
 */
router.get('/my-children', authenticate, authorize(['parent']), parentStudentRelationshipController.getParentChildren);

/**
 * @swagger
 * /api/parent-student-relationships/student/{studentId}/parents:
 *   get:
 *     summary: Get parents for a student
 *     tags: [Parent-Student Relationships]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Parents retrieved successfully
 */
router.get('/student/:studentId/parents', authenticate, authorize(['super_admin', 'principal', 'teacher', 'student']), parentStudentRelationshipController.getStudentParents);

module.exports = router;
