/* eslint-disable @typescript-eslint/no-explicit-any */
import { inject, injectable } from 'inversify';
import BaseQueue from '@services/queues/base.queue';
import TYPES from '@root/types';
import { EmailJob } from '@user/interfaces/user.interface';
import { EmailWorker } from '@workers/email.worker';

export enum EmailQueueName {
  FORGOT_PASSWORD = 'forgotPassword',
  RESET_PASSWORD = 'resetPassword'
}

export interface EmailQueue {
  addEmailJob(name: string, data: EmailJob): void;
}

@injectable()
export default class EmailQueueImpl extends BaseQueue implements EmailQueue {
  private emailWorker: EmailWorker;

  constructor(@inject(TYPES.EmailWorker) emailWorker: EmailWorker) {
    super('emails');
    this.emailWorker = emailWorker;
    this.processJob(EmailQueueName.FORGOT_PASSWORD, 5, this.emailWorker.addNotificationEmail);
    this.processJob(EmailQueueName.RESET_PASSWORD, 5, this.emailWorker.addNotificationEmail);
  }

  addEmailJob(name: string, data: EmailJob): void {
    this.addJob(name, data);
  }
}
