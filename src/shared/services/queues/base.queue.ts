import Queue, { Job } from 'bull';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';
import Logger from 'bunyan';
import config from '@root/config';
import loggerHelper from '@globals/helpers/logger';

let bullAdapters: BullAdapter[] = [];
export let serverAdapter: ExpressAdapter;

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
}
