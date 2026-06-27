import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendSuccess } from '../utils/response';
import * as adminService from '../services/admin.service';
import * as authService from '../services/auth.service';
import { CustomError } from '../utils/CustomError';
import User from '../models/User';

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

export const createAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { username, email } = req.body;
    const result = await authService.inviteAdminUser(username, email);
    sendSuccess(res, 'Admin user invited successfully. Setup link has been sent.', result, 201);
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await adminService.getCategories();
    sendSuccess(res, 'Categories retrieved successfully', result, 200);
  } catch (error) {
    next(error);
  }
};

export const getQuizzes = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await adminService.getQuizzes();
    sendSuccess(res, 'Quizzes retrieved successfully', result, 200);
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await adminService.getUsers();
    sendSuccess(res, 'Users retrieved successfully', result, 200);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const targetUserId = req.params.userId;
    const callerId = req.user?.userId;
    const callerRole = req.user?.role;

    if (targetUserId === callerId) {
      throw new CustomError('You cannot delete your own account', 400);
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      throw new CustomError('User not found', 404);
    }

    const isTargetAdmin = targetUser.role === 'Admin' || targetUser.role === 'SuperAdmin';
    if (isTargetAdmin && callerRole !== 'SuperAdmin') {
      throw new CustomError('Access denied. Administrator accounts can only be deleted by a Super Admin.', 403);
    }

    const result = await adminService.deleteUser(targetUserId);
    sendSuccess(res, result.message, null, 200);
  } catch (error) {
    next(error);
  }
};


