import bcrypt from 'bcrypt';
import crypto from 'crypto';
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

export const requestPasswordReset = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new CustomError('User with this email does not exist', 404);
  }

  // Generate random token
  const resetToken = crypto.randomBytes(20).toString('hex');
  
  // Set token and expiration (1 hour from now)
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
  await user.save();

  // Generate reset URL for local logging/testing
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
  console.log(`[PASSWORD RESET LINK]: ${resetUrl}`);
  
  return { resetToken, resetUrl };
};

export const resetUserPassword = async (token: string, newPassword: string) => {
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: new Date() }
  });

  if (!user) {
    throw new CustomError('Password reset token is invalid or has expired', 400);
  }

  // Hash new password
  user.passwordHash = await bcrypt.hash(newPassword, 10);
  
  // Clear reset fields
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  return { message: 'Password has been successfully updated' };
};

