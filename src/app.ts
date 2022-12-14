import express, { Express } from 'express';
import AppServer from '@root/setUpServer';
import connectToDbClient from '@root/setUpDatabase';
import config from '@root/config';
import loggerHelper from '@globals/helpers/logger';
const logger = loggerHelper.create('[app]');

interface IApplication {
  init(): void;
}

class Application implements IApplication {
  public init(): void {
    logger.debug('Initialising app');

    // setup configs and load environment variables
    this.loadConfig();

    // connect to database
    connectToDbClient();

    const app: Express = express();

    const server: AppServer = new AppServer(app);
    server.start();
  }

  private loadConfig(): void {
    config.validate();
    config.cloudinary();
  }
}

const app: Application = new Application();
app.init();
