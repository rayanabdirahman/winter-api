import { AuthPayload } from '@auth/interfaces/auth.interface';
import { Request, Response, NextFunction } from 'express';
import { UnAuthorisedError } from '@globals/helpers/errorHandler';
import loggerHelper from '@globals/helpers/logger';
import JwtHelper from '@globals/helpers/jwt';
const logger = loggerHelper.create('AuthGuardMiddleware');

export interface AuthGuard {
  authenticate(req: Request, res: Response, next: NextFunction): Promise<void>;
  authorise(req: Request, res: Response, next: NextFunction): Promise<void>;
}

class AuthGuardImpl implements AuthGuard {
  async authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { session } = req;
      if (!session?.jwt) {
        throw new UnAuthorisedError('Token not available. Please sign in');
      }

      // verify token
      const payload: AuthPayload = await JwtHelper.decode(session?.jwt);
      if (!payload) {
        throw new UnAuthorisedError('Invalid token. Please sign in');
      }
      req.currentUser = payload;

      next();
    } catch (error) {
      logger.error(error);
      throw new UnAuthorisedError('Token not available. Please sign in');
    }
  }
  async authorise(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (!req.currentUser) {
      throw new UnAuthorisedError('Authentication is required to access this route');
    }
    next();
  }
}

const AuthGuard = new AuthGuardImpl();
export default AuthGuard;
