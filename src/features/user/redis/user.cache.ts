import { injectable } from 'inversify';
import RedisBaseCache from '@services/redis/base.cache';
import { UserDocument } from '@user/interfaces/user.interface';
import loggerHelper from '@globals/helpers/logger';
import { ServerError } from '@globals/helpers/errorHandler';
const logger = loggerHelper.create('UserCache');

export interface UserCache {
  save(key: string, userUId: string, createdUser: UserDocument): Promise<void>;
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
      await this.client.HSET(`users: ${key}`, dataToSave);
    } catch (err) {
      logger.error(err);
      throw new ServerError('Error when saving to redis. Try again');
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
