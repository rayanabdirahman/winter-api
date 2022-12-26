import express, { Application, NextFunction, Request, Response } from 'express';
import http from 'http';
import hpp from 'hpp';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieSession from 'cookie-session';
import HTTP_STATUS from 'http-status-codes';
import { Server } from 'socket.io';
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';
import 'express-async-errors';
import config from '@root/config';
import container from '@root/inversify.config';
import { RegistrableController } from './features/registrable.controller';
import TYPES from '@root/types';
import { CustomError, IErrorResponse } from '@globals/helpers/errorHandler';
import loggerHelper from '@globals/helpers/logger';
import { serverAdapter } from '@services/queues/base.queue';
import SocketIOPostHandler from '@post/sockets/post.service';
const logger = loggerHelper.create('[setUpServer]');
export interface IAppServer {
  start(): void;
}

export default class AppServer implements IAppServer {
  private app: Application;

  constructor(app: Application) {
    this.app = app;
  }

  public start(): void {
    logger.debug('starting app server');
    this.useSecurityMiddleware(this.app);
    this.useStandardMiddleware(this.app);
    this.registerRoutes(this.app);
    this.globalErrorHandler(this.app);
    this.startServer(this.app);
  }

  private useSecurityMiddleware(app: Application): void {
    app.use(
      cookieSession({
        name: config.COOKIE_SESSION_NAME,
        keys: [`${config.COOKIE_SESSION_KEY_ONE}`, `${config.COOKIE_SESSION_KEY_TWO}`],
        maxAge: 24 * 7 * 3600, // 7 days,
        secure: config.NODE_ENV !== 'development'
      })
    );
    app.use(hpp());
    app.use(helmet());
    app.use(
      cors({
        origin: config.CLIENT_URL,
        credentials: true,
        optionsSuccessStatus: 200,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
      })
    );
  }

  private useStandardMiddleware(app: Application): void {
    app.use(compression());
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  }

  private registerRoutes(app: Application): void {
    // register api routes
    const controllers: RegistrableController[] = container.getAll<RegistrableController>(TYPES.Controller);
    controllers.forEach((controller) => controller.registerRoutes(app));

    // test api route
    app.get(`/${config.API_URL}`, async (req: express.Request, res: express.Response): Promise<express.Response> => {
      return res.json({ 'Winter API': 'Version 1' });
    });

    // route for bull queues
    app.use('/queues', serverAdapter.getRouter());
  }

  private globalErrorHandler(app: Application): void {
    // catch request to non existing urls
    app.all('*', (req: Request, res: Response) => {
      res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ status: 'error', statusCode: HTTP_STATUS.NOT_FOUND, message: `${req.originalUrl} not found` });
    });

    // use global error handler
    app.use((error: IErrorResponse, _req: Request, res: Response, next: NextFunction) => {
      logger.error('error: ', error);
      if (error instanceof CustomError) {
        return res.status(error.statusCode).json(error.serializeErrors());
      }
      next();
    });
  }

  private async startServer(app: Application): Promise<void> {
    try {
      const httpServer: http.Server = new http.Server(app);
      const socketIOServer: Server = await this.createSocketIO(httpServer);
      this.startHttpServer(httpServer);
      this.socketIOConnections(socketIOServer);
    } catch (error) {
      logger.error(`[startServer]: Failed to start server: ${error}`);
    }
  }

  private startHttpServer(httpServer: http.Server): void {
    httpServer.listen(config.PORT, () => logger.info(`App running on PORT: ${config.PORT}`));
  }

  private async createSocketIO(httpServer: http.Server): Promise<Server> {
    const io: Server = new Server(httpServer, {
      cors: {
        origin: config.CLIENT_URL,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
      }
    });
    const pubClient = createClient({ url: config.REDIS_HOST });
    const subClient = pubClient.duplicate();
    await Promise.all([pubClient.connect(), subClient.connect()]);
    io.adapter(createAdapter(pubClient, subClient));
    return io;
  }

  private socketIOConnections(io: Server): void {
    const socketIOPostHandler = new SocketIOPostHandler(io);
    socketIOPostHandler.listen();
  }
}
