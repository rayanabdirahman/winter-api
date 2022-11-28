import express, { Application } from "express";
import http from "http";
import hpp from "hpp";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieSession from "cookie-session";
import HTTP_STATUS from "http-status-codes";
import "express-async-errors";
import config from "./config";

export interface IAppServer {
  start(): void;
}

export default class AppServer implements IAppServer {
  private app: Application;

  constructor(app: Application) {
    this.app = app;
  }

  public start(): void {
    console.debug(`[AppServer]: starting app server`);
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
        keys: [
          `${config.COOKIE_SESSION_KEY_ONE}`,
          `${config.COOKIE_SESSION_KEY_TWO}`,
        ],
        maxAge: 24 * 7 * 3600, // 7 days,
        secure: config.NODE_ENV !== "development",
      })
    );
    app.use(hpp());
    app.use(helmet());
    app.use(
      cors({
        origin: config.CLIENT_URL,
        credentials: true,
        optionsSuccessStatus: 200,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      })
    );
  }

  private useStandardMiddleware(app: Application): void {
    app.use(compression());
    app.use(express.json({ limit: "50mb" }));
    app.use(express.urlencoded({ extended: true, limit: "50mb" }));
  }

  private registerRoutes(app: Application): void {}

  private globalErrorHandler(app: Application): void {}

  private async startServer(app: Application): Promise<void> {
    try {
      const httpServer: http.Server = new http.Server(app);
      this.startHttpServer(httpServer);
    } catch (error) {
      console.error(`Failed to start server: ${error}`);
    }
  }

  private startHttpServer(httpServer: http.Server): void {
    httpServer.listen(config.PORT, () =>
      console.info(`App running on PORT: ${config.PORT}`)
    );
  }

  private createSocketIO(httpServer: http.Server): void {}
}
