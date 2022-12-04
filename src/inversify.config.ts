import 'reflect-metadata';
import { Container } from 'inversify';
import TYPES from '@root/types';
import { RegistrableController } from './features/registrable.controller';
import AuthController from '@auth/controllers/auth.controller';
import AuthServiceImpl, { AuthService } from '@auth/services/auth.service';
import AuthRepositoryImpl, { AuthRepository } from '@auth/repositories/auth.repository';
import AuthQueueImpl, { AuthQueue } from '@auth/queues/auth.queue';
import AuthWorkerImpl, { AuthWorker } from '@auth/workers/auth.worker';
import UserRepositoryImpl, { UserRepository } from '@user/repositories/user.repository';
import UserQueueImpl, { UserQueue } from '@user/queues/user.queue';
import UserWorkerImpl, { UserWorker } from '@user/workers/user.worker';

const container = new Container();

// controllers
container.bind<RegistrableController>(TYPES.Controller).to(AuthController);

// services
container.bind<AuthService>(TYPES.AuthService).to(AuthServiceImpl);

// repositories
container.bind<AuthRepository>(TYPES.AuthRepository).to(AuthRepositoryImpl);
container.bind<UserRepository>(TYPES.UserRepository).to(UserRepositoryImpl);

// Queues
container.bind<AuthQueue>(TYPES.AuthQueue).to(AuthQueueImpl);
container.bind<UserQueue>(TYPES.UserQueue).to(UserQueueImpl);

// workers
container.bind<AuthWorker>(TYPES.AuthWorker).to(AuthWorkerImpl);
container.bind<UserWorker>(TYPES.UserWorker).to(UserWorkerImpl);

export default container;
