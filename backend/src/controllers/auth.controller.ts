import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendSuccess } from '../utils/response';
import * as authService from '../services/auth.service';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, password, role } = req.body;
    const result = await authService.registerUser(username, email, password, role);
    sendSuccess(res, 'User registered successfully', result, 201);
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);
    sendSuccess(res, 'Login successful', result, 200);
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await authService.getUserProfile(req.user?.userId as string);
    sendSuccess(res, 'Profile retrieved successfully', user, 200);
  } catch (error) {
    next(error);
  }
};

