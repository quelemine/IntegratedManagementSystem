const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { authenticate } = require('../middleware/auth');
const { authorize, schoolScope } = require('../middleware/authorization');
const { validate, validationRules } = require('../middleware/validation');
const { auditLog } = require('../middleware/audit');

/**
 * @swagger
 * /api/quizzes:
 *   get:
 *     summary: Get all quizzes
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: course_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by course
 *       - in: query
 *         name: teacher_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by teacher
 *       - in: query
 *         name: class_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by class
 *     responses:
 *       200:
 *         description: Quizzes retrieved successfully
 */
router.get('/', authenticate, schoolScope, quizController.getQuizzes);

/**
 * @swagger
 * /api/quizzes/{id}:
 *   get:
 *     summary: Get quiz by ID
 *     tags: [Quizzes]
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
 *         description: Quiz retrieved successfully
 *       404:
 *         description: Quiz not found
 */
router.get('/:id', authenticate, schoolScope, validationRules.uuidParam, validate, quizController.getQuizById);

/**
 * @swagger
 * /api/quizzes:
 *   post:
 *     summary: Create quiz
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - course_id
 *               - title
 *             properties:
 *               course_id:
 *                 type: string
 *                 format: uuid
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               duration:
 *                 type: integer
 *               total_questions:
 *                 type: integer
 *               total_points:
 *                 type: integer
 *               start_date:
 *                 type: string
 *                 format: date-time
 *               end_date:
 *                 type: string
 *                 format: date-time
 *               shuffle_questions:
 *                 type: boolean
 *               show_results_immediately:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Quiz created successfully
 */
router.post('/', authenticate, authorize(['super_admin', 'principal', 'teacher']), auditLog('create'), quizController.createQuiz);

/**
 * @swagger
 * /api/quizzes/{id}:
 *   put:
 *     summary: Update quiz
 *     tags: [Quizzes]
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
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               duration:
 *                 type: integer
 *               total_questions:
 *                 type: integer
 *               total_points:
 *                 type: integer
 *               start_date:
 *                 type: string
 *                 format: date-time
 *               end_date:
 *                 type: string
 *                 format: date-time
 *               shuffle_questions:
 *                 type: boolean
 *               show_results_immediately:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Quiz updated successfully
 *       404:
 *         description: Quiz not found
 */
router.put('/:id', authenticate, authorize(['super_admin', 'principal', 'teacher']), schoolScope, validationRules.uuidParam, validate, auditLog('update'), quizController.updateQuiz);

/**
 * @swagger
 * /api/quizzes/{id}:
 *   delete:
 *     summary: Delete quiz
 *     tags: [Quizzes]
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
 *         description: Quiz deleted successfully
 *       404:
 *         description: Quiz not found
 */
router.delete('/:id', authenticate, authorize(['super_admin', 'principal']), schoolScope, validationRules.uuidParam, validate, auditLog('delete'), quizController.deleteQuiz);

/**
 * @swagger
 * /api/quizzes/score:
 *   post:
 *     summary: Record quiz score
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - student_id
 *               - quiz_id
 *               - score
 *               - percentage
 *             properties:
 *               student_id:
 *                 type: string
 *                 format: uuid
 *               quiz_id:
 *                 type: string
 *                 format: uuid
 *               score:
 *                 type: number
 *               percentage:
 *                 type: number
 *     responses:
 *       201:
 *         description: Quiz score recorded successfully
 */
router.post('/score', authenticate, authorize(['super_admin', 'principal', 'teacher']), auditLog('create'), quizController.recordQuizScore);

/**
 * @swagger
 * /api/quizzes/scores/{student_id}:
 *   get:
 *     summary: Get student quiz scores
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: student_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Student quiz scores retrieved successfully
 */
router.get('/scores/:student_id', authenticate, schoolScope, validationRules.uuidParam, validate, quizController.getStudentQuizScores);

module.exports = router;
