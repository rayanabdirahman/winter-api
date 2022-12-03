import mongoose, { Document } from 'mongoose';
import { ObjectId } from 'mongodb';

export interface UserDocument extends Document {
  _id: string | ObjectId;
  authId: string | ObjectId;
  uId?: string;
  username?: string;
  email?: string;
  password?: string;
  avatarColor?: string;
  postsCount: number;
  blocked: mongoose.Types.ObjectId[];
  blockedBy: mongoose.Types.ObjectId[];
  followersCound: number;
  followingCound: number;
  notifications: Notification;
  social: SocialLinks;
  bgImage: string;
  bgImageId: string;
  profilePicture: string;
  passwordResetToken?: string;
  passwordResetExpires?: number | string;
  createdAt?: Date;
}

export interface User {
  _id: string | ObjectId;
  authId: string | ObjectId;
  uId: string;
  username: string;
  email: string;
  password?: string;
  avatarColor: string;
  postsCount: number;
  blocked: mongoose.Types.ObjectId[];
  blockedBy: mongoose.Types.ObjectId[];
  followersCound: number;
  followingCound: number;
  notifications: Notification;
  social: SocialLinks;
  bgImage: string;
  bgImageId: string;
  profilePicture: string;
  passwordResetToken?: string;
  passwordResetExpires?: number | string;
  createdAt: Date;
}

export interface ResetPassword {
  username: string;
  email: string;
  ipaddress: string;
  date: string;
}

export interface Notification {
  message: boolean;
  reaction: boolean;
  comment: boolean;
  follows: boolean;
}

export interface SocialLinks {
  facebook: string;
  instagram: string;
  twitter: string;
  youtube: string;
}

export interface SocketData {
  blockedUser: string;
  blockedBy: string;
}

export interface SignIn {
  userId: string;
}

export interface UserJobInfo {
  key?: string;
  value: string | SocialLinks;
}

export interface UserJob {
  keyOne?: string;
  keyTwo?: string;
  key?: string;
  value: string | Notification | UserDocument;
}

export interface EmailJob {
  recievedEmail: string;
  template: string;
  subject: string;
}
