import HTTP_STATUS from 'http-status-codes';
import { Application, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import config from '@root/config';
import { RegistrableController } from '../../registrable.controller';
import joiValidate from '@globals/decorators/joi.decorator';
import signUpSchema from '@auth/validation/signup.schema';
import { AuthService } from '@auth/services/auth.service';
import TYPES from '@root/types';
import { SignInModel, SignUpModel } from '@auth/interfaces/auth.interface';
import textTransformHelper from '@globals/helpers/textTransform';
import signInSchema from '@auth/validation/signin.schema';

@injectable()
export default class AuthController implements RegistrableController {
  private authService: AuthService;

  constructor(@inject(TYPES.AuthService) authService: AuthService) {
    this.authService = authService;
    this.signUp = this.signUp.bind(this);
    this.signIn = this.signIn.bind(this);
    this.signOut = this.signOut.bind(this);
  }

  registerRoutes(app: Application): void {
    app.post(`/${config.API_URL}/auth/signup`, this.signUp);
    app.post(`/${config.API_URL}/auth/signin`, this.signIn);
    app.get(`/${config.API_URL}/auth/signout`, this.signOut);
  }

  @joiValidate(signUpSchema)
  async signUp(req: Request, res: Response): Promise<Response> {
    const model: SignUpModel = { ...req.body, email: textTransformHelper.toLowerCase(req.body.email) };

    const { token, user } = await this.authService.signUp(model);

    req.session = { jwt: token };

    return res
      .status(HTTP_STATUS.CREATED)
      .json({ status: 'success', statusCode: HTTP_STATUS.CREATED, message: 'User created successfully', data: { token, user } });
  }

  @joiValidate(signInSchema)
  async signIn(req: Request, res: Response): Promise<Response> {
    const model: SignInModel = { ...req.body, email: textTransformHelper.toLowerCase(req.body.email) };

    const { token, user } = await this.authService.signIn(model);

    req.session = { jwt: token };

    return res
      .status(HTTP_STATUS.OK)
      .json({ status: 'success', statusCode: HTTP_STATUS.CREATED, message: 'User signed in successfully', data: { token, user } });
  }

  async signOut(req: Request, res: Response): Promise<Response> {
    req.session = null;

    return res
      .status(HTTP_STATUS.OK)
      .json({ status: 'success', statusCode: HTTP_STATUS.CREATED, message: 'User signed out successfully', data: {} });
  }
}
