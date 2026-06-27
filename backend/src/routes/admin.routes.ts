import { Router } from 'express';
import { createCategory, createQuiz, addQuestion, createAdmin } from '../controllers/admin.controller';
import { authMiddleware, roleGuard } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);
router.use(roleGuard(['Admin']));

/**
 * @openapi
 * /api/admin/categories:
 *   post:
 *     summary: Create a new quiz category (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, description]
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Category created successfully
 *       403:
 *         description: Forbidden
 */
router.post('/categories', createCategory);

/**
 * @openapi
 * /api/admin/quizzes:
 *   post:
 *     summary: Create a new quiz configuration (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [categoryId, title, description, timeLimit]
 *             properties:
 *               categoryId:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               timeLimit:
 *                 type: number
 *     responses:
 *       201:
 *         description: Quiz created successfully
 *       403:
 *         description: Forbidden
 */
router.post('/quizzes', createQuiz);

/**
 * @openapi
 * /api/admin/quizzes/{quizId}/questions:
 *   post:
 *     summary: Add a new question to a quiz (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: quizId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [questionText, points, options]
 *             properties:
 *               questionText:
 *                 type: string
 *               points:
 *                 type: number
 *               options:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [optionText, isCorrect]
 *                   properties:
 *                     optionText:
 *                       type: string
 *                     isCorrect:
 *                       type: boolean
 *     responses:
 *       201:
 *         description: Question added successfully
 *       403:
 *         description: Forbidden
 */
router.post('/quizzes/:quizId/questions', addQuestion);

/**
 * @openapi
 * /api/admin/create-admin:
 *   post:
 *     summary: Register a new Admin user (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password]
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Admin user registered successfully
 *       403:
 *         description: Forbidden
 */
router.post('/create-admin', createAdmin);

export default router;
