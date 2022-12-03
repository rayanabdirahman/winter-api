import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';

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
  email: string;
  username: string;
  avatarColor: string;
  iat?: number;
}

export interface AuthDocument extends Document {
  _id: string | ObjectId;
  uId: string;
  username: string;
  email: string;
  password: string;
  avatarColor: string;
  createdAt: Date;
  comparePasswords: (password: string) => Promise<boolean>;
  hashPasswords: (password: string) => Promise<string>;
}

export interface SignUpData {
  _id: ObjectId;
  uId: string;
  email: string;
  password: string;
  username: string;
  avatarColor: string;
}

export interface SignUpModel {
  username: string;
  email: string;
  password: string;
  avatarColor: string;
  avatarImage: string;
}

export interface AuthJob {
  value: string | AuthDocument;
}
