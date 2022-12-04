const TYPES = {
  Controller: Symbol('Controller'),
  AuthService: Symbol('AuthService'),
  AuthRepository: Symbol('AuthRepository'),
  AuthQueue: Symbol('AuthQueue'),
  AuthWorker: Symbol('AuthWorker'),
  UserRepository: Symbol('UserRepository'),
  UserQueue: Symbol('UserQueue'),
  UserWorker: Symbol('UserWorker')
};

export default TYPES;
