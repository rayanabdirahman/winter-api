import { injectable, unmanaged } from 'inversify';
import { createClient } from 'redis';
import Logger from 'bunyan';
import loggerHelper from '@globals/helpers/logger';
import config from '@root/config';

export type RedisClient = ReturnType<typeof createClient>;

@injectable()
export default abstract class RedisBaseCache {
  client: RedisClient;
  logger: Logger;

  constructor(@unmanaged() cacheName: string) {
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
