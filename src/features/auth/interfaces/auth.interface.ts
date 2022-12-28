import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';
import { UserDocument } from '@user/interfaces/user.interface';

declare global {
  namespace Express {
    interface Request {
      currentUser?: AuthPayload;
    }
  }
}

export interface AuthPayload {
  userId: string;
  uId: string;
  name: string;
  username: string;
  email: string;
  iat?: number;
}

export interface AuthDocument extends Document {
  _id: string | ObjectId;
  uId: string;
  name: string;
  username: string;
  email: string;
  password: string;
  createdAt: Date;
  passwordResetToken?: string;
  passwordResetExpires?: number | string;
  comparePassword: (password: string) => Promise<boolean>;
  hashPassword: (password: string) => Promise<string>;
}

export interface SignUpModel {
  name: string;
  username: string;
  email: string;
  password: string;
  avatar: string;
}

export interface SignInModel {
  email: string;
  password: string;
}

export interface ForgotPasswordModel {
  email: string;
}

export interface ResetPasswordModel {
  password: string;
  confirmPassword: string;
}

export interface AuthJob {
  value: string | AuthDocument | UserDocument;
}
