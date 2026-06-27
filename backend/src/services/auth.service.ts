import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { CustomError } from '../utils/CustomError';

export const registerUser = async (username: string, email: string, password: string, role: 'Admin' | 'Student') => {
  // Check if user already exists
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    throw new CustomError('Username or Email is already registered', 400);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = new User({ username, email, passwordHash, role });
  await user.save();

  return { userId: user._id };
};

export const loginUser = async (email: string, password: string) => {
  const user = await User.findOne({ email });
  
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new CustomError('Invalid credentials', 401);
  }
  
  const token = jwt.sign(
    { userId: user._id, role: user.role }, 
    process.env.JWT_SECRET as string, 
    { expiresIn: '2h' }
  );
  
  return {
    token,
    user: { id: user._id, username: user.username, role: user.role }
  };
};

export const getUserProfile = async (userId: string) => {
  const user = await User.findById(userId).select('-passwordHash');
  if (!user) {
    throw new CustomError('User profile not found', 404);
  }
  return user;
};
