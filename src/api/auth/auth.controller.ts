import { Application, Request, Response } from "express";
import { injectable } from "inversify";
import config from "src/config";
import { RegistrableController } from "../registrable.controller";

@injectable()
export default class AuthController implements RegistrableController {
  registerRoutes(app: Application): void {
    app.get(`/${config.API_URL}/auth/signup`, (req: Request, res: Response) =>
      res.json({ hello: "world" })
    );
  }
}
