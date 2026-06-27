import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendSuccess } from '../utils/response';
import * as adminService from '../services/admin.service';

export const createCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, description } = req.body;
    const result = await adminService.createCategory(name, description);
    sendSuccess(res, 'Category created successfully', result, 201);
  } catch (error) {
    next(error);
  }
};

export const createQuiz = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { categoryId, title, description, timeLimit } = req.body;
    const result = await adminService.createQuiz(
      categoryId, 
      title, 
      description, 
      timeLimit, 
      req.user?.userId
    );
    sendSuccess(res, 'Quiz created successfully', result, 201);
  } catch (error) {
    next(error);
  }
};

export const addQuestion = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { questionText, points, options } = req.body;
    const quizId = req.params.quizId;
    const result = await adminService.addQuestion(quizId, questionText, points, options);
    sendSuccess(res, 'Question added successfully', result, 201);
  } catch (error) {
    next(error);
  }
};

