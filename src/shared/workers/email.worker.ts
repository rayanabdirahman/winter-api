import { inject, injectable } from 'inversify';
import { DoneCallback, Job } from 'bull';
import loggerHelper from '@globals/helpers/logger';
import TYPES from '@root/types';
import { EmailService } from '@services/emails/email.service';
const logger = loggerHelper.create('EmailWorker');

export interface EmailWorker {
  addNotificationEmail(job: Job, done: DoneCallback): Promise<void>;
}

@injectable()
export default class EmailWorkerImpl implements EmailWorker {
  private emailService: EmailService;

  constructor(@inject(TYPES.EmailService) emailService: EmailService) {
    this.emailService = emailService;
    this.addNotificationEmail = this.addNotificationEmail.bind(this);
  }

  async addNotificationEmail(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { receiverEmail, subject, template } = job.data;

      await this.emailService.sendEmail(receiverEmail, subject, template);

      job.progress(100);
      done(null, job.data);
    } catch (error) {
      logger.error(error);
      done(error as Error);
    }
  }
}
