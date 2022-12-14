import mongoose from 'mongoose';
import { PostDocument } from '@post/interfaces/post.interface';

const PostSchema: mongoose.Schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  username: { type: String },
  email: { type: String },
  avatarColor: { type: String },
  profilePicture: { type: String },
  post: { type: String, default: '' },
  bgColor: { type: String, default: '' },
  imgVersion: { type: String, default: '' },
  imgId: { type: String, default: '' },
  feelings: { type: String, default: '' },
  gifUrl: { type: String, default: '' },
  privacy: { type: String, default: '' },
  commentsCount: { type: Number, default: 0 },
  reactions: {
    like: { type: Number, default: 0 },
    love: { type: Number, default: 0 },
    happy: { type: Number, default: 0 },
    wow: { type: Number, default: 0 },
    sad: { type: Number, default: 0 },
    angry: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now }
});

const PostModel: mongoose.Model<PostDocument> = mongoose.model<PostDocument>('Post', PostSchema, 'Post');
export default PostModel;
