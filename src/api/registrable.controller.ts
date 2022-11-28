import { Application } from "express";

export interface RegistrableController {
  registerRoutes(app: Application): void;
}
