import { Router } from 'express';
import { getQuizzes, startQuizAttempt, submitQuizAttempt, getAttemptsHistory, getLeaderboard } from '../controllers/student.controller';
import { authMiddleware, roleGuard } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);
router.use(roleGuard(['Student']));

/**
 * @openapi
 * /api/student/quizzes:
 *   get:
 *     summary: Retrieve list of quizzes (Student only)
 *     tags: [Student]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Quizzes retrieved successfully
 *       403:
 *         description: Forbidden
 */
router.get('/quizzes', getQuizzes);

/**
 * @openapi
 * /api/student/quizzes/{quizId}/play:
 *   get:
 *     summary: Fetch quiz details and questions without answers (Student only)
 *     tags: [Student]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: quizId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Quiz play info retrieved
 *       403:
 *         description: Forbidden
 */
router.get('/quizzes/:quizId/play', startQuizAttempt);

/**
 * @openapi
 * /api/student/quizzes/{quizId}/submit:
 *   post:
 *     summary: Submit a quiz attempt and calculate score (Student only)
 *     tags: [Student]
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
 *             required: [startedAt, answers]
 *             properties:
 *               startedAt:
 *                 type: string
 *                 format: date-time
 *               answers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [questionId, selectedOptionId]
 *                   properties:
 *                     questionId:
 *                       type: string
 *                     selectedOptionId:
 *                       type: string
 *     responses:
 *       200:
 *         description: Submission graded successfully
 *       430:
 *         description: Evaluation Error
 */
router.post('/quizzes/:quizId/submit', submitQuizAttempt);

/**
 * @openapi
 * /api/student/attempts/history:
 *   get:
 *     summary: Get attempts history for logged in student (Student only)
 *     tags: [Student]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: History retrieved
 *       403:
 *         description: Forbidden
 */
router.get('/attempts/history', getAttemptsHistory);

/**
 * @openapi
 * /api/student/quizzes/{quizId}/leaderboard:
 *   get:
 *     summary: Get leaderboard for a specific quiz (Student only)
 *     tags: [Student]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: quizId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Leaderboard retrieved successfully
 *       403:
 *         description: Forbidden
 */
router.get('/quizzes/:quizId/leaderboard', getLeaderboard);

export default router;
