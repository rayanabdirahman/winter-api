import loggerHelper from '@globals/helpers/logger';
import RedisBaseCache from './base.cache';

const logger = loggerHelper.create('[RedisConnection]');

class RedisConnection extends RedisBaseCache {
  constructor() {
    super('redisConnection');
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
      const pingResponse = await this.client.ping();
      if (pingResponse === 'PONG') logger.info('[RedisDB] connected successfully ✅');
    } catch (err) {
      logger.error(err);
    }
  }
}

const redisConnection = new RedisConnection();
export default redisConnection;
