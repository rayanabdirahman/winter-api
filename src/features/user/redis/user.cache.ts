import { injectable } from 'inversify';
import RedisBaseCache from '@services/redis/base.cache';
import { UserDocument } from '@user/interfaces/user.interface';
import loggerHelper from '@globals/helpers/logger';
import { ServerError } from '@globals/helpers/errorHandler';
import jsonHelper from '@globals/helpers/jsonHelper';
const logger = loggerHelper.create('UserCache');

export interface UserCache {
  save(key: string, userUId: string, createdUser: UserDocument): Promise<void>;
  getOne(userId: string): Promise<UserDocument | null>;
}

@injectable()
export default class UserCacheImpl extends RedisBaseCache implements UserCache {
  constructor() {
    super('userCache');
  }

  async save(key: string, userUId: string, createdUser: UserDocument): Promise<void> {
    try {
      const createdAt = new Date();
      const userObj = { ...createdUser, createdAt } as UserDocument;
      const dataToSave = this.getKeyValuePairs(userObj);

      // create a connect if connect is not open
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      await this.client.ZADD('user', { score: parseInt(userUId, 10), value: `${key}` });
      await this.client.HSET(`users:${key}`, dataToSave);
    } catch (err) {
      logger.error(err);
      throw new ServerError('Error when saving to redis. Try again');
    }
  }

  async getOne(userId: string): Promise<UserDocument | null> {
    try {
      // create a connect if connect is not open
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const response = (await this.client.HGETALL(`users:${userId}`)) as unknown as UserDocument;
      response._id = jsonHelper.parse(`${response._id}`);
      response.authId = jsonHelper.parse(`${response.authId}`);
      response.createdAt = new Date(jsonHelper.parse(`${response.createdAt}`));
      response.postsCount = jsonHelper.parse(`${response.postsCount}`);
      response.blocked = jsonHelper.parse(`${response.blocked}`);
      response.blockedBy = jsonHelper.parse(`${response.blockedBy}`);
      response.notifications = jsonHelper.parse(`${response.notifications}`);
      response.social = jsonHelper.parse(`${response.social}`);
      response.followersCount = jsonHelper.parse(`${response.followersCount}`);
      response.followingCount = jsonHelper.parse(`${response.followingCount}`);
      response.bgImageId = jsonHelper.parse(`${response.bgImageId}`);
      response.bgImage = jsonHelper.parse(`${response.bgImage}`);
      response.avatar = jsonHelper.parse(`${response.avatar}`);

      return response;
    } catch (err) {
      logger.error(err);
      throw new ServerError('Error when getting user from redis. Try again');
    }
  }

  private getKeyValuePairs = (user: UserDocument): string[] => {
    const arr: string[] = [];
    for (const [key, value] of Object.entries(user)) {
      if (typeof value === 'string') {
        const pair = [`${key}`, `${value}`];
        arr.push(...pair);
      } else {
        const pair = [`${key}`, JSON.stringify(value)];
        arr.push(...pair);
      }
    }
    return arr;
  };
}
