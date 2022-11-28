import "reflect-metadata";
import { Container } from "inversify";
import TYPES from "./types";
import { RegistrableController } from "./api/registrable.controller";
import AuthController from "./api/auth/auth.controller";

const container = new Container();

// controllers
container.bind<RegistrableController>(TYPES.Controller).to(AuthController);

export default container;
