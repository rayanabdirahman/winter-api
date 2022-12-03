import { createClient } from 'redis';
import Logger from 'bunyan';
import loggerHelper from '@globals/helpers/logger';
import config from '@root/config';

export type RedisClient = ReturnType<typeof createClient>;

export default abstract class RedisBaseCache {
  client: RedisClient;
  logger: Logger;

  constructor(cacheName: string) {
    this.client = createClient({ url: config.REDIS_HOST });
    this.logger = loggerHelper.create(`[${cacheName}]`);
    this.cacheError();
  }

  private cacheError(): void {
    this.client.on('error', (error: unknown) => {
      this.logger.error(error);
    });
  }
}
