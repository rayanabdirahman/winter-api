import { ObjectId } from 'mongodb';
import { inject, injectable } from 'inversify';
import crypto from 'crypto';
import { UserDocument } from '@user/interfaces/user.interface';
import { BadRequestError } from '@globals/helpers/errorHandler';
import {
  AuthDocument,
  SignInModel,
  SignUpModel,
  AuthPayload,
  ResetPasswordModel,
  ForgotPasswordModel
} from '@auth/interfaces/auth.interface';
import { AuthRepository } from '@auth/repositories/auth.repository';
import TYPES from '@root/types';
import loggerHelper from '@globals/helpers/logger';
import nanoIdHelper from '@globals/helpers/nanoId';
import { UserCache } from '@user/redis/user.cache';
import { AuthQueue, AuthQueueName } from '@auth/queues/auth.queue';
import { UserQueue, UserQueueName } from '@user/queues/user.queue';
import JwtHelper from '@globals/helpers/jwt';
import { CloudinaryService } from '@services/cloudinary/cloudinary.service';
// import { CloudinaryResponseType } from '@globals/helpers/cloudinary';
import { UserRepository } from '@user/repositories/user.repository';
const logger = loggerHelper.create('[AuthService]');

export interface AuthService {
  signUp(model: SignUpModel): Promise<{ token: string; user: UserDocument }>;
  signIn(model: SignInModel): Promise<{ token: string; user: UserDocument }>;
  forgotPassword(model: ForgotPasswordModel): Promise<{ token: string; user: AuthDocument }>;
  resetPassword(token: string, model: ResetPasswordModel): Promise<{ token: string; user: AuthDocument }>;
  currentUser(user: AuthPayload): Promise<{ isUser: boolean; user: UserDocument }>;
}

@injectable()
export default class AuthServiceImpl implements AuthService {
  private authRepository: AuthRepository;
  private userRepository: UserRepository;
  private authQueue: AuthQueue;
  private userQueue: UserQueue;
  private userCache: UserCache;
  private cloudinaryService: CloudinaryService;

  constructor(
    @inject(TYPES.AuthRepository) authRepository: AuthRepository,
    @inject(TYPES.UserRepository) userRepository: UserRepository,
    @inject(TYPES.AuthQueue) authQueue: AuthQueue,
    @inject(TYPES.UserQueue) userQueue: UserQueue,
    @inject(TYPES.UserCache) userCache: UserCache,
    @inject(TYPES.CloudinaryService) cloudinaryService: CloudinaryService
  ) {
    this.authRepository = authRepository;
    this.userRepository = userRepository;
    this.authQueue = authQueue;
    this.userQueue = userQueue;
    this.userCache = userCache;
    this.cloudinaryService = cloudinaryService;
  }

  async signUp(model: SignUpModel): Promise<{ token: string; user: UserDocument }> {
    try {
      // check if username or email is taken
      const isUserTaken = await this.isUsernameOrEmailTaken(model.username, model.email);
      if (isUserTaken) {
        throw new BadRequestError('A user with these credentials already exists');
      }

      const _id = new ObjectId();
      const userId = new ObjectId();
      const uId = nanoIdHelper.generateInt();
      const createdAt = new Date();

      const authDocument = { ...model, _id, uId, createdAt } as unknown as AuthDocument;

      // upload image to cloudinary
      // const cloudinaryResponse = await this.cloudinaryService.upload(model.avatar, `${userId}`);

      // add to user redis cache
      // const userDataForRedisCache = await this.addUserToRedis(userId, authDocument, cloudinaryResponse);
      const userDataForRedisCache = await this.addUserToRedis(userId, authDocument, model.avatar);

      // save auth and user documents to db using workers
      await this.addUserAuthJobs(userDataForRedisCache, authDocument);

      // sign JWT token
      const token = await JwtHelper.sign(authDocument, userId);
      return { token, user: userDataForRedisCache };
    } catch (error) {
      logger.error(`[UserService: signUp]: Unabled to create user: ${error}`);
      throw error;
    }
  }

  async signIn(model: SignInModel): Promise<{ token: string; user: UserDocument }> {
    try {
      // check if auth user with email exists
      const existingAuthUser = await this.authRepository.findOneByEmail(model.email);
      if (!existingAuthUser) {
        throw new BadRequestError('Invalid credentials');
      }

      // check if passwords match
      const doPasswordsMatch = await existingAuthUser.comparePassword(model.password);
      if (!doPasswordsMatch) {
        throw new BadRequestError('Invalid credentials');
      }

      // get user details using auth id
      const user = await this.userRepository.findOneByAuthId(existingAuthUser._id);
      if (!user) {
        throw new BadRequestError('Cannot find user with these credentials');
      }

      // sign JWT token
      const token = await JwtHelper.sign(existingAuthUser, user._id);

      const mergedUserObj = {
        ...user,
        authId: existingAuthUser.id,
        name: existingAuthUser.name,
        username: existingAuthUser.username,
        email: existingAuthUser.email,
        uId: existingAuthUser.uId,
        createdAt: existingAuthUser.createdAt
      } as UserDocument;

      return { token, user: mergedUserObj };
    } catch (error) {
      logger.error(`[UserService: signIn]: Unabled to sign in user: ${error}`);
      throw error;
    }
  }

  async forgotPassword(model: ForgotPasswordModel): Promise<{ token: string; user: AuthDocument }> {
    try {
      // check if auth user with email exists
      const existingAuthUser = await this.authRepository.findOneByEmail(model.email);
      if (!existingAuthUser) {
        throw new BadRequestError('Invalid credentials');
      }

      const buffer = await Promise.resolve(crypto.randomBytes(20));
      const token = buffer.toString('hex');
      const expiresIn = Date.now() * 60 * 60 * 1000; // token to expire in an hour

      // update auth user document to include password reset details
      await this.authRepository.updateOneById(existingAuthUser._id as string, {
        passwordResetToken: token,
        passwordResetExpires: expiresIn
      });

      return { token, user: existingAuthUser };
    } catch (error) {
      logger.error(`[UserService: signIn]: Unabled to sign in user: ${error}`);
      throw error;
    }
  }

  async resetPassword(token: string, model: ResetPasswordModel): Promise<{ token: string; user: AuthDocument }> {
    try {
      // check if auth user with valid password token exists
      const existingAuthUser = await this.authRepository.findOne({ passwordResetToken: token, passwordResetExpires: { $gt: Date.now() } });
      if (!existingAuthUser) {
        throw new BadRequestError('Reset password token has expired');
      }

      await this.authRepository.updateOnePasswordById(existingAuthUser._id as string, model.password);

      return { token, user: existingAuthUser };
    } catch (error) {
      logger.error(`[UserService: signIn]: Unabled to sign in user: ${error}`);
      throw error;
    }
  }

  async currentUser(user: AuthPayload): Promise<{ isUser: boolean; user: UserDocument }> {
    try {
      // check redis cache for user first
      const cachedUser = await this.userCache.getOne(user.userId);
      const existingUser = cachedUser ? cachedUser : await this.userRepository.findOneById(user.userId);
      if (!existingUser) {
        throw new BadRequestError('User not found');
      }

      if (!Object.keys(existingUser).length) {
        throw new BadRequestError('User not found');
      }

      return { isUser: true, user: existingUser };
    } catch (error) {
      logger.error(`[UserService: currentUser]: Unabled to return current user: ${error}`);
      throw error;
    }
  }

  // private async addUserToRedis(userId: ObjectId, authDocument: AuthDocument, cloudinaryResponse: CloudinaryResponseType) {
  private async addUserToRedis(userId: ObjectId, authDocument: AuthDocument, avatar: string) {
    const userDataForRedisCache = this.formateUserDataForRedisCache(userId, authDocument);
    // userDataForRedisCache.avatar = `https://res.cloudinary.com/daqewh79b/image/upload/v${cloudinaryResponse?.version}/${userId}.png`;
    userDataForRedisCache.avatar = avatar;
    await this.userCache.save(`${userId}`, authDocument.uId, userDataForRedisCache);
    return userDataForRedisCache;
  }

  private async addUserAuthJobs(user: UserDocument, authUser: AuthDocument) {
    this.authQueue.addAuthUserJob(AuthQueueName.ADD_AUTH_USER, { value: authUser });
    this.userQueue.addUserJob(UserQueueName.ADD_USER, { value: user });
  }

  private async isUsernameOrEmailTaken(username: string, email: string): Promise<boolean | AuthDocument> {
    const user = await this.authRepository.findOne({
      $or: [{ username }, { email }]
    });
    return user ? Promise.resolve(user) : Promise.resolve(false);
  }

  private formateUserDataForRedisCache(userId: ObjectId, data: AuthDocument): UserDocument {
    return {
      _id: userId,
      authId: data._id,
      uId: data.uId,
      name: data.name,
      username: data.username,
      email: data.email,
      // password: data.password,
      avatar: '',
      blocked: [],
      blockedBy: [],
      bgImage: '',
      bgImageId: '',
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      notifications: {
        message: true,
        reaction: true,
        comment: true,
        follows: true
      },
      social: {
        facebook: '',
        instagram: '',
        twitter: '',
        youtube: ''
      }
    } as unknown as UserDocument;
  }
}
