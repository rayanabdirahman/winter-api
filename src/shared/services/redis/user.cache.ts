import { ServerError } from './../../globals/helpers/errorHandler';
import loggerHelper from '@globals/helpers/logger';
import { UserDocument } from '@user/interfaces/user.interface';
import RedisBaseCache from './base.cache';

const logger = loggerHelper.create('[UserCache]');

class UserCache extends RedisBaseCache {
  constructor() {
    super('userCache');
  }

  getKeyValuePairs = (user: UserDocument): string[] => {
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
}

const userCache = new UserCache();
export default userCache;
