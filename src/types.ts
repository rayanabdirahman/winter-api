const TYPES = {
  Controller: Symbol('Controller'),
  CloudinaryService: Symbol('CloudinaryService'),
  MailTransport: Symbol('MailTransport'),
  AuthService: Symbol('AuthService'),
  AuthRepository: Symbol('AuthRepository'),
  AuthQueue: Symbol('AuthQueue'),
  AuthWorker: Symbol('AuthWorker'),
  UserRepository: Symbol('UserRepository'),
  UserQueue: Symbol('UserQueue'),
  UserWorker: Symbol('UserWorker'),
  UserCache: Symbol('UserCache'),
  EmailQueue: Symbol('EmailQueue'),
  EmailWorker: Symbol('EmailWorker')
};

export default TYPES;
