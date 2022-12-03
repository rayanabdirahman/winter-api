import HTTP_STATUS from 'http-status-codes';
import { Application, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import config from '@root/config';
import { RegistrableController } from '../../registrable.controller';
import joiValidate from '@globals/decorators/joi.decorator';
import signUpSchema from '@auth/validation/signup.schema';
import { AuthService } from '@auth/services/auth.service';
import TYPES from '@root/types';
import { SignUpModel } from '@auth/interfaces/auth.interface';

@injectable()
export default class AuthController implements RegistrableController {
  private authService: AuthService;

  constructor(@inject(TYPES.AuthService) authService: AuthService) {
    this.authService = authService;
    this.signUp = this.signUp.bind(this);
  }

  registerRoutes(app: Application): void {
    app.post(`/${config.API_URL}/auth/signup`, this.signUp);
  }

  @joiValidate(signUpSchema)
  async signUp(req: Request, res: Response): Promise<Response> {
    const model: SignUpModel = { ...req.body };

    await this.authService.signUp(model);

    return res
      .status(HTTP_STATUS.CREATED)
      .json({ status: 'success', statusCode: HTTP_STATUS.CREATED, message: 'User created successfully', data: model });
  }
}
