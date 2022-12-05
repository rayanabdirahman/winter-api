import { inject, injectable } from 'inversify';
import { DoneCallback, Job } from 'bull';
import loggerHelper from '@globals/helpers/logger';
import { AuthRepository } from '@auth/repositories/auth.repository';
import TYPES from '@root/types';
const logger = loggerHelper.create('AuthWorker');

export interface AuthWorker {
  addAuthUserToDB(job: Job, done: DoneCallback): Promise<void>;
}

@injectable()
export default class AuthWorkerImpl implements AuthWorker {
  private authRepository: AuthRepository;

  constructor(@inject(TYPES.AuthRepository) authRepository: AuthRepository) {
    this.authRepository = authRepository;
    this.addAuthUserToDB = this.addAuthUserToDB.bind(this);
  }

  async addAuthUserToDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { value } = job.data;

      await this.authRepository.createOne(value);

      job.progress(100);
      done(null, job.data);
    } catch (error) {
      logger.error(error);
      done(error as Error);
    }
  }
}
