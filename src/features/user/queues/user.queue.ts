import { inject, injectable } from 'inversify';
import BaseQueue from '@services/queues/base.queue';
import { UserWorker } from '@user/workers/user.worker';
import TYPES from '@root/types';

export interface UserQueue {
  addUserJob(name: string, data: any): void;
}

@injectable()
export default class UserQueueImpl extends BaseQueue implements UserQueue {
  private userWorker: UserWorker;

  constructor(@inject(TYPES.UserWorker) userWorker: UserWorker) {
    super('auth');
    this.userWorker = userWorker;
    this.processJob('addUserToDB', 5, this.userWorker.addUserToDB);
  }

  addUserJob(name: string, data: any): void {
    this.addJob(name, data);
  }
}
