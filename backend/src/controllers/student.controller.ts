import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendSuccess } from '../utils/response';
import * as studentService from '../services/student.service';

export const getQuizzes = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const quizzes = await studentService.getQuizzes();
    sendSuccess(res, 'Quizzes list retrieved successfully', quizzes, 200);
  } catch (error) {
    next(error);
  }
};

export const startQuizAttempt = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const quizId = req.params.quizId;
    const result = await studentService.startQuizAttempt(quizId);
    sendSuccess(res, 'Quiz loaded successfully', result, 200);
  } catch (error) {
    next(error);
  }
};

export const submitQuizAttempt = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const quizId = req.params.quizId;
    const userId = req.user?.userId;
    const { answers, startedAt } = req.body;

    const result = await studentService.submitQuizAttempt(quizId, userId, answers, startedAt);
    sendSuccess(res, 'Submission evaluated and logged successfully', result, 200);
  } catch (error) {
    next(error);
  }
};

export const getAttemptsHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const attempts = await studentService.getAttemptsHistory(req.user?.userId);
    sendSuccess(res, 'Attempts history retrieved successfully', attempts, 200);
  } catch (error) {
    next(error);
  }
};

export const getLeaderboard = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const leaderboard = await studentService.getLeaderboard(req.params.quizId);
    sendSuccess(res, 'Leaderboard retrieved successfully', leaderboard, 200);
  } catch (error) {
    next(error);
  }
};

