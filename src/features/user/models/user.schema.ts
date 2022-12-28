import { UserDocument } from '@user/interfaces/user.interface';
import mongoose from 'mongoose';

const userSchema: mongoose.Schema = new mongoose.Schema({
  authId: { type: mongoose.Schema.Types.ObjectId, ref: 'Auth', index: true },
  avatar: { type: String, default: '' },
  postsCount: { type: Number, default: 0 },
  followersCount: { type: Number, default: 0 },
  followingCount: { type: Number, default: 0 },
  // passwordResetToken: { type: String, default: '' },
  // passwordResetExpires: { type: Number },
  blocked: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  blockedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  notifications: {
    messages: { type: Boolean, default: true },
    reactions: { type: Boolean, default: true },
    comments: { type: Boolean, default: true },
    follows: { type: Boolean, default: true }
  },
  social: {
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    twitter: { type: String, default: '' },
    youtube: { type: String, default: '' }
  },
  bgImageVersion: { type: String, default: '' },
  bgImageId: { type: String, default: '' }
});

const UserModel: mongoose.Model<UserDocument> = mongoose.model<UserDocument>('User', userSchema, 'User');
export default UserModel;
