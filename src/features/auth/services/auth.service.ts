import { ObjectId } from 'mongodb';
import { inject, injectable } from 'inversify';
import { UserDocument } from '@user/interfaces/user.interface';
import { BadRequestError } from '@globals/helpers/errorHandler';
import { AuthDocument, SignInModel, SignUpModel, AuthPayload } from '@auth/interfaces/auth.interface';
import { AuthRepository } from '@auth/repositories/auth.repository';
import TYPES from '@root/types';
import loggerHelper from '@globals/helpers/logger';
import nanoIdHelper from '@globals/helpers/nanoId';
import { UserCache } from '@user/redis/user.cache';
import { AuthQueue, AuthQueueName } from '@auth/queues/auth.queue';
import { UserQueue, UserQueueName } from '@user/queues/user.queue';
import JwtHelper from '@globals/helpers/jwt';
import { CloudinaryService } from '@services/cloudinary/cloudinary.service';
import { CloudinaryResponseType } from '@globals/helpers/cloudinary';
import { UserRepository } from '@user/repositories/user.repository';
const logger = loggerHelper.create('[AuthService]');

export interface AuthService {
  signUp(model: SignUpModel): Promise<{ token: string; user: UserDocument }>;
  signIn(model: SignInModel): Promise<{ token: string; user: UserDocument }>;
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
      const cloudinaryResponse = await this.cloudinaryService.upload(model.avatarImage, `${userId}`);

      // add to user redis cache
      const userDataForRedisCache = await this.addUserToRedis(userId, authDocument, cloudinaryResponse);

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
        username: existingAuthUser.username,
        email: existingAuthUser.email,
        avatarColor: existingAuthUser.avatarColor,
        uId: existingAuthUser.uId,
        createdAt: existingAuthUser.createdAt
      } as UserDocument;

      return { token, user: mergedUserObj };
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

  private async addUserToRedis(userId: ObjectId, authDocument: AuthDocument, cloudinaryResponse: CloudinaryResponseType) {
    const userDataForRedisCache = this.formateUserDataForRedisCache(userId, authDocument);
    userDataForRedisCache.profilePicture = `https://res.cloudinary.com/daqewh79b/image/upload/v${cloudinaryResponse?.version}/${userId}.png`;
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
      username: data.username,
      email: data.email,
      password: data.password,
      avatarColor: data.avatarColor,
      profilePicture: '',
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
