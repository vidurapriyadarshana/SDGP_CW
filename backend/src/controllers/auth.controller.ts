import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendSuccess } from '../utils/response';
import * as authService from '../services/auth.service';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, password } = req.body;
    const result = await authService.registerUser(username, email, password, 'Student');
    sendSuccess(res, 'User registered successfully. Please verify your account using the OTP sent to your email.', result, 201);
  } catch (error) {
    next(error);
  }
};

export const verifyAccount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, otp } = req.body;
    const result = await authService.verifyAccount(email, otp);
    sendSuccess(res, result.message, null, 200);
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, role } = req.body;
    const result = await authService.loginUser(email, password, role);
    // Returns { requiresOTP: true, email }
    sendSuccess(res, 'Verification code sent to your email.', result, 200);
  } catch (error) {
    next(error);
  }
};

export const verifyLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, otp } = req.body;
    const result = await authService.verifyLoginOTP(email, otp);
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

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    const result = await authService.requestPasswordReset(email);
    sendSuccess(res, 'Password reset link generated and logged successfully', result, 200);
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, newPassword } = req.body;
    const result = await authService.resetUserPassword(token, newPassword);
    sendSuccess(res, result.message, null, 200);
  } catch (error) {
    next(error);
  }
};

export const completeRegistration = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, password } = req.body;
    const result = await authService.completeAdminRegistration(token, password);
    sendSuccess(res, result.message, null, 200);
  } catch (error) {
    next(error);
  }
};



