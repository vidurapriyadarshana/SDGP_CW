import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendSuccess } from '../utils/response';
import { CustomError } from '../utils/CustomError';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, password, role } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      throw new CustomError('Username or Email is already registered', 400);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({ username, email, passwordHash, role });
    await user.save();
    
    sendSuccess(res, 'User registered successfully', { userId: user._id }, 201);
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new CustomError('Invalid credentials', 401);
    }
    
    const token = jwt.sign(
      { userId: user._id, role: user.role }, 
      process.env.JWT_SECRET as string, 
      { expiresIn: '2h' }
    );
    
    sendSuccess(res, 'Login successful', {
      token,
      user: { id: user._id, username: user.username, role: user.role }
    }, 200);
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user?.userId).select('-passwordHash');
    if (!user) {
      throw new CustomError('User profile not found', 404);
    }
    sendSuccess(res, 'Profile retrieved successfully', user, 200);
  } catch (error) {
    next(error);
  }
};
