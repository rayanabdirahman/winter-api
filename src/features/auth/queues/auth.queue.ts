import { inject, injectable } from 'inversify';
import BaseQueue from '@services/queues/base.queue';
import { AuthJob } from '@auth/interfaces/auth.interface';
import { AuthWorker } from '@auth/workers/auth.worker';
import TYPES from '@root/types';

export enum AuthQueueName {
  ADD_AUTH_USER = 'addAuthUserToDB'
}

export interface AuthQueue {
  addAuthUserJob(name: string, data: AuthJob): void;
}

@injectable()
export default class AuthQueueImpl extends BaseQueue implements AuthQueue {
  private authWorker: AuthWorker;

  constructor(@inject(TYPES.AuthWorker) authWorker: AuthWorker) {
    super('auth');
    this.authWorker = authWorker;
    this.processJob(AuthQueueName.ADD_AUTH_USER, 5, this.authWorker.addAuthUserToDB);
  }

  addAuthUserJob(name: string, data: AuthJob): void {
    this.addJob(name, data);
  }
}
