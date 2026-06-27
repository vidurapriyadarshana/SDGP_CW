import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { CustomError } from '../utils/CustomError';
import { sendOTPEmail } from '../utils/email';
import { mailConfig, mailTransporter, isMailConfigured } from '../config/nodemailer';

const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // Generates a 6-digit code
};

export const registerUser = async (username: string, email: string, password: string, role: 'Admin' | 'Student') => {
  // Check if user already exists
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    throw new CustomError('Username or Email is already registered', 400);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = new User({ username, email, passwordHash, role, isVerified: false });

  // Generate and set signup verification OTP
  const otp = generateOTP();
  user.otpCode = otp;
  user.otpExpires = new Date(Date.now() + 600000); // 10 minutes validity
  
  await user.save();
  await sendOTPEmail(email, otp, 'VERIFICATION');

  return { email: user.email };
};

export const verifyAccount = async (email: string, otp: string) => {
  const user = await User.findOne({
    email,
    otpCode: otp,
    otpExpires: { $gt: new Date() }
  });

  if (!user) {
    throw new CustomError('Invalid or expired verification code', 400);
  }

  user.isVerified = true;
  user.otpCode = undefined;
  user.otpExpires = undefined;
  await user.save();

  return { message: 'Account successfully verified and activated' };
};

export const loginUser = async (email: string, password: string, requiredRole?: 'Admin' | 'Student') => {
  const user = await User.findOne({ email });
  
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new CustomError('Invalid credentials', 401);
  }

  // Enforce role restriction if requested
  if (requiredRole && user.role !== requiredRole) {
    throw new CustomError(`Access denied. Please use the appropriate login portal.`, 403);
  }

  // Ensure user is verified first
  if (!user.isVerified) {
    // Generate new verification OTP to let them verify their account if needed
    const otp = generateOTP();
    user.otpCode = otp;
    user.otpExpires = new Date(Date.now() + 600000);
    await user.save();
    await sendOTPEmail(email, otp, 'VERIFICATION');
    throw new CustomError('Your account is not verified yet. A new verification OTP has been sent to your email.', 403);
  }

  // Generate and send Login 2FA OTP
  const otp = generateOTP();
  user.otpCode = otp;
  user.otpExpires = new Date(Date.now() + 600000); // 10 minutes validity
  
  await user.save();
  await sendOTPEmail(email, otp, '2FA');

  return { requiresOTP: true, email: user.email };
};

export const verifyLoginOTP = async (email: string, otp: string) => {
  const user = await User.findOne({
    email,
    otpCode: otp,
    otpExpires: { $gt: new Date() }
  });

  if (!user) {
    throw new CustomError('Invalid or expired login code', 400);
  }

  // Clear OTP fields
  user.otpCode = undefined;
  user.otpExpires = undefined;
  await user.save();

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

export const inviteAdminUser = async (username: string, email: string) => {
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    throw new CustomError('Username or Email is already registered', 400);
  }

  const inviteToken = crypto.randomBytes(20).toString('hex');
  const user = new User({
    username,
    email,
    passwordHash: 'INVITED_PENDING_PASSWORD',
    role: 'Admin',
    isVerified: false,
    resetPasswordToken: inviteToken,
    resetPasswordExpires: new Date(Date.now() + 24 * 3600 * 1000) // 24 hours
  });

  await user.save();

  // Send invitation email
  const inviteUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/complete-registration?token=${inviteToken}`;
  
  const subject = 'Admin Invitation - Quiz Web App';
  const textContent = `You have been invited as an Administrator on Quiz Web App. Please complete your registration and set your password using this link: ${inviteUrl}`;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #4f46e5; text-align: center;">Quiz Web App - Admin Invitation</h2>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="font-size: 16px; color: #334155;">Hello,</p>
      <p style="font-size: 16px; color: #334155;">
        You have been invited to join the Quiz Web App as an **Administrator**. To accept this invitation, please set up your account password by clicking the button below:
      </p>
      <div style="text-align: center; margin: 25px 0;">
        <a href="${inviteUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Set Up Account</a>
      </div>
      <p style="font-size: 12px; color: #64748b; text-align: center;">
        If the button above does not work, copy and paste this URL into your browser: <br/>
        <a href="${inviteUrl}" style="color: #4f46e5;">${inviteUrl}</a>
      </p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="font-size: 12px; color: #94a3b8; text-align: center;">
        Quiz Web App © ${new Date().getFullYear()}
      </p>
    </div>
  `;

  if (isMailConfigured && mailTransporter) {
    try {
      await mailTransporter.sendMail({
        from: mailConfig.from,
        to: email,
        subject: subject,
        text: textContent,
        html: htmlContent
      });
    } catch (error) {
      console.error(`[INVITATION EMAIL ERROR] Failed to send email to ${email}:`, error);
    }
  }

  // Always log for development convenience
  console.log('\n' + '='.repeat(60));
  console.log(`[DEVELOPMENT INVITE LINK]: ${inviteUrl}`);
  console.log('='.repeat(60) + '\n');

  return { email: user.email, inviteToken };
};

export const completeAdminRegistration = async (token: string, password: string) => {
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: new Date() }
  });
  
  if (!user) {
    throw new CustomError('Invitation token is invalid or has expired', 400);
  }
  
  user.passwordHash = await bcrypt.hash(password, 10);
  user.isVerified = true;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  
  return { message: 'Registration completed successfully' };
};


