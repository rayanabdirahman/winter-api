import { AuthJob } from '@auth/interfaces/auth.interface';
import BaseQueue from './base.queue';

class AuthQueue extends BaseQueue {
  constructor() {
    super('auth');
  }

  addAuthUserJob(name: string, data: AuthJob): void {
    this.addJob(name, data);
  }
}

const authQueue = new AuthQueue();
export default authQueue;
