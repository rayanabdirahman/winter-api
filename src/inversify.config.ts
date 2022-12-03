import 'reflect-metadata';
import { Container } from 'inversify';
import TYPES from '@root/types';
import { RegistrableController } from './features/registrable.controller';
import AuthController from '@auth/controllers/auth.controller';
import AuthServiceImpl, { AuthService } from '@auth/services/auth.service';
import AuthRepositoryImpl, { AuthRepository } from '@auth/repositories/auth.repository';

const container = new Container();

// controllers
container.bind<RegistrableController>(TYPES.Controller).to(AuthController);

// services
container.bind<AuthService>(TYPES.AuthService).to(AuthServiceImpl);

// repositories
container.bind<AuthRepository>(TYPES.AuthRepository).to(AuthRepositoryImpl);

export default container;
