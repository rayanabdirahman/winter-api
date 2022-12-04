import { inject, injectable } from 'inversify';
import BaseQueue from '@services/queues/base.queue';
import { AuthJob } from '@auth/interfaces/auth.interface';
import { AuthWorker } from '@auth/workers/auth.worker';
import TYPES from '@root/types';

export interface AuthQueue {
  addAuthUserJob(name: string, data: AuthJob): void;
}

@injectable()
export default class AuthQueueImpl extends BaseQueue implements AuthQueue {
  private authWorker: AuthWorker;

  constructor(@inject(TYPES.AuthWorker) authWorker: AuthWorker) {
    super('auth');
    this.authWorker = authWorker;
    this.processJob('addAuthUserToDB', 5, this.authWorker.addAuthUserToDB);
  }

  addAuthUserJob(name: string, data: AuthJob): void {
    console.log(' AuthQueueImpl addAuthUserJob called');
    this.addJob(name, data);
  }
}
