import mongoose from 'mongoose';
import bycryptHelper from '@globals/helpers/bcrypt';
import { AuthDocument } from '@auth/interfaces/auth.interface';

const AuthSchema: mongoose.Schema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true, unique: true },
    uId: { type: String, trim: true, unique: true },
    email: { type: String, required: true, trim: true, unique: true },
    password: { type: String, required: true },
    avatarColor: { type: String },
    createdAt: { type: Date, default: Date.now },
    passwordResetToken: { type: String, default: '' },
    passwordResetExpires: { type: Number }
  },
  {
    toJSON: {
      transform(_doc, ret) {
        delete ret.password;
        return ret;
      }
    }
  }
);

// Hash user password before saving
AuthSchema.pre('save', async function (this: AuthDocument, next: () => void) {
  const hashedPassword = await bycryptHelper.encryptPassword(this.password);
  this.password = hashedPassword;
  next();
});

AuthSchema.methods.hashPassword = async function (password: string): Promise<string> {
  return bycryptHelper.encryptPassword(password);
};

AuthSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  const hashedPassword = (this as unknown as AuthDocument).password;
  return bycryptHelper.comparePassword(password, hashedPassword);
};

const AuthModel: mongoose.Model<AuthDocument> = mongoose.model<AuthDocument>('Auth', AuthSchema, 'Auth');
export default AuthModel;
