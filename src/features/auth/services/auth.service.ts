import { AuthQueue } from './../queues/auth.queue';
import { ObjectId } from 'mongodb';
import { inject, injectable } from 'inversify';
import { omit } from 'lodash';
import { UserDocument } from '@user/interfaces/user.interface';
import { BadRequestError } from '@globals/helpers/errorHandler';
import { AuthDocument, SignUpModel } from '@auth/interfaces/auth.interface';
import { AuthRepository } from '@auth/repositories/auth.repository';
import TYPES from '@root/types';
import loggerHelper from '@globals/helpers/logger';
import cloudinaryHelper from '@globals/helpers/cloudinary';
import nanoIdHelper from '@globals/helpers/nanoId';
import userCache from '@services/redis/user.cache';
import { UserQueue } from '@user/queues/user.queue';
import JwtHelper from '@globals/helpers/jwt';
const logger = loggerHelper.create('[AuthService]');

export interface AuthService {
  signUp(model: SignUpModel): Promise<string>;
}

@injectable()
export default class AuthServiceImpl implements AuthService {
  private authRepository: AuthRepository;
  private authQueue: AuthQueue;
  private userQueue: UserQueue;

  constructor(
    @inject(TYPES.AuthRepository) authRepository: AuthRepository,
    @inject(TYPES.AuthQueue) authQueue: AuthQueue,
    @inject(TYPES.UserQueue) userQueue: UserQueue
  ) {
    this.authRepository = authRepository;
    this.authQueue = authQueue;
    this.userQueue = userQueue;
  }

  async signUp(model: SignUpModel): Promise<string> {
    try {
      // check if username or email is taken
      const isUserTaken = await this.isUsernameOrEmailTaken(model.username, model.email);
      if (isUserTaken) {
        throw new BadRequestError('A user with these credentials already exists');
      }

      const userId = new ObjectId();

      const authDocument = {
        ...model,
        _id: new ObjectId(),
        uId: nanoIdHelper.generateInt(),
        createdAt: new Date()
      } as unknown as AuthDocument;

      const cloudinaryResponse = await cloudinaryHelper.upload(model.avatarImage, `${userId}`, true, true);
      if (!cloudinaryResponse?.public_id) {
        throw new BadRequestError('Error when uploading avatar image to cloudinary. Try again');
      }

      // // add to redis cache
      const userDataForRedisCache = this.formateUserDataForRedisCache(userId, authDocument);
      userDataForRedisCache.profilePicture = `https://res.cloudinary.com/daqewh79b/image/upload/v${cloudinaryResponse.version}/${userId}.png`;
      await userCache.save(`${userId}`, authDocument.uId, userDataForRedisCache);

      // save user to database
      // remove fields not required for user database
      omit(userDataForRedisCache, ['uId', 'username', 'email', 'avatarColor', 'password']);
      this.authQueue.addAuthUserJob('addAuthUserToDB', { value: userDataForRedisCache });
      this.userQueue.addUserJob('addUserToDB', { value: userDataForRedisCache });

      // sign JWT token
      return await JwtHelper.sign(authDocument, userId);
    } catch (error) {
      logger.error(`[UserService: signUp]: Unabled to create user: ${error}`);
      throw error;
    }
  }

  private async isUsernameOrEmailTaken(username: string, email: string): Promise<boolean> {
    const user = await this.authRepository.findOne({
      $or: [{ username }, { email }]
    });
    return user ? Promise.resolve(true) : Promise.resolve(false);
  }

  private formateUserDataForRedisCache(userObjId: ObjectId, data: AuthDocument): UserDocument {
    return {
      _id: userObjId,
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
