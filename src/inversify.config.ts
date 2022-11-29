import 'reflect-metadata';
import { Container } from 'inversify';
import TYPES from '@root/types';
import { RegistrableController } from './features/registrable.controller';
import AuthController from '@auth/auth.controller';

const container = new Container();

// controllers
container.bind<RegistrableController>(TYPES.Controller).to(AuthController);

export default container;
