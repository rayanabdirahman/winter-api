import { ObjectId } from 'mongodb';
import { inject, injectable } from 'inversify';
import { omit } from 'lodash';
import { UserDocument } from '@user/interfaces/user.interface';
import { BadRequestError } from '@globals/helpers/errorHandler';
import { AuthDocument, SignUpModel } from '@auth/interfaces/auth.interface';
import { AuthRepository } from '@auth/repositories/auth.repository';
import TYPES from '@root/types';
import loggerHelper from '@globals/helpers/logger';
import nanoIdHelper from '@globals/helpers/nanoId';
import userCache from '@services/redis/user.cache';
import { AuthQueue, AuthQueueName } from '@auth/queues/auth.queue';
import { UserQueue, UserQueueName } from '@user/queues/user.queue';
import JwtHelper from '@globals/helpers/jwt';
import { CloudinaryService } from '@services/cloudinary/cloudinary.service';
import { CloudinaryResponseType } from '@globals/helpers/cloudinary';
const logger = loggerHelper.create('[AuthService]');

export interface AuthService {
  signUp(model: SignUpModel): Promise<string>;
}

@injectable()
export default class AuthServiceImpl implements AuthService {
  private authRepository: AuthRepository;
  private authQueue: AuthQueue;
  private userQueue: UserQueue;
  private cloudinaryService: CloudinaryService;

  constructor(
    @inject(TYPES.AuthRepository) authRepository: AuthRepository,
    @inject(TYPES.AuthQueue) authQueue: AuthQueue,
    @inject(TYPES.UserQueue) userQueue: UserQueue,
    @inject(TYPES.CloudinaryService) cloudinaryService: CloudinaryService
  ) {
    this.authRepository = authRepository;
    this.authQueue = authQueue;
    this.userQueue = userQueue;
    this.cloudinaryService = cloudinaryService;
  }

  async signUp(model: SignUpModel): Promise<string> {
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
      await this.addUserAuthJobs(userDataForRedisCache);

      // sign JWT token
      return await JwtHelper.sign(authDocument, userId);
    } catch (error) {
      logger.error(`[UserService: signUp]: Unabled to create user: ${error}`);
      throw error;
    }
  }

  private async addUserToRedis(userId: ObjectId, authDocument: AuthDocument, cloudinaryResponse: CloudinaryResponseType) {
    const userDataForRedisCache = this.formateUserDataForRedisCache(userId, authDocument);
    userDataForRedisCache.profilePicture = `https://res.cloudinary.com/daqewh79b/image/upload/v${cloudinaryResponse?.version}/${userId}.png`;
    await userCache.save(`${userId}`, authDocument.uId, userDataForRedisCache);
    return userDataForRedisCache;
  }

  private async addUserAuthJobs(user: UserDocument) {
    // remove fields not required for user database
    omit(user, ['uId', 'username', 'email', 'avatarColor', 'password']);
    this.authQueue.addAuthUserJob(AuthQueueName.ADD_AUTH_USER, { value: user });
    this.userQueue.addUserJob(UserQueueName.ADD_USER, { value: user });
  }

  private async isUsernameOrEmailTaken(username: string, email: string): Promise<boolean> {
    const user = await this.authRepository.findOne({
      $or: [{ username }, { email }]
    });
    return user ? Promise.resolve(true) : Promise.resolve(false);
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
