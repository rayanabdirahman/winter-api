import { inject, injectable } from 'inversify';
import { DoneCallback, Job } from 'bull';
import loggerHelper from '@globals/helpers/logger';
import { UserRepository } from '@user/repositories/user.repository';
import TYPES from '@root/types';
const logger = loggerHelper.create('UserWorker');

export interface UserWorker {
  addUserToDB(job: Job, done: DoneCallback): Promise<void>;
}

@injectable()
export default class UserWorkerImpl implements UserWorker {
  private userRepository: UserRepository;

  constructor(@inject(TYPES.UserRepository) userRepository: UserRepository) {
    this.userRepository = userRepository;
    this.addUserToDB = this.addUserToDB.bind(this);
  }

  async addUserToDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { value } = job.data;

      await this.userRepository.createOne(value);

      job.progress(100);
      done(null, job.data);
    } catch (error) {
      logger.error(error);
      done(error as Error);
    }
  }
}
