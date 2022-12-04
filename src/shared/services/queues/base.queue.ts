import { injectable } from 'inversify';
import Queue, { Job } from 'bull';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';
import Logger from 'bunyan';
import config from '@root/config';
import loggerHelper from '@globals/helpers/logger';
import { AuthJob } from '@auth/interfaces/auth.interface';

type BaseJobDataType = AuthJob;

let bullAdapters: BullAdapter[] = [];
export let serverAdapter: ExpressAdapter;

@injectable()
export default abstract class BaseQueue {
  queue: Queue.Queue;
  logger: Logger;

  constructor(queueName: string) {
    this.queue = new Queue(queueName, `${config.REDIS_HOST}`);
    this.logger = loggerHelper.create(`${queueName}Queue`);
    bullAdapters.push(new BullAdapter(this.queue));
    // below done to remove possible duplication
    bullAdapters = [...new Set(bullAdapters)];
    serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath('/queues');

    createBullBoard({
      queues: bullAdapters,
      serverAdapter
    });

    this.queue.on('completed', (job: Job) => {
      job.remove();
    });

    this.queue.on('global:completed', (jobId: Job) => {
      this.logger.info(`[Job ${jobId}]: completed`);
    });

    this.queue.on('global:stalled', (jobId: Job) => {
      this.logger.info(`[Job ${jobId}]: stalled`);
    });
  }

  protected addJob(name: string, data: BaseJobDataType): void {
    this.queue.add(name, data, { attempts: 3, backoff: { type: 'fixed', delay: 5000 } });
  }

  protected processJob(name: string, concurrency: number, callback: Queue.ProcessCallbackFunction<void>): void {
    this.queue.process(name, concurrency, callback);
  }
}
