import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  passwordHash: string;
  role: 'Admin' | 'Student' | 'SuperAdmin';
  createdAt: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  isVerified: boolean;
  otpCode?: string;
  otpExpires?: Date;
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'Student', 'SuperAdmin'], required: true },
  createdAt: { type: Date, default: Date.now },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  isVerified: { type: Boolean, default: false },
  otpCode: { type: String },
  otpExpires: { type: Date }
});

export default model<IUser>('User', UserSchema);


