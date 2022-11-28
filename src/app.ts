import express, { Express } from "express";
import AppServer from "./setUpServer";
import connectToDbClient from "./setUpDatabase";
import config from "./config";

interface IApplication {
  init(): void;
}

class Application implements IApplication {
  public init(): void {
    console.debug(`[START]: Initialising app`);

    // load environment variables
    this.loadConfig();

    // connect to database
    connectToDbClient();

    const app: Express = express();

    const server: AppServer = new AppServer(app);
    server.start();
  }

  private loadConfig(): void {
    config.validate();
  }
}

const app: Application = new Application();
app.init();
