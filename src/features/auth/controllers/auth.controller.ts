import { BadRequestError } from '@globals/helpers/errorHandler';
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
import AuthGuard from '@root/shared/middlewares/authguard.middleware';
import { MailTransport } from '@services/emails/mail.transport';

@injectable()
export default class AuthController implements RegistrableController {
  private authService: AuthService;
  private mailTransport: MailTransport;

  constructor(@inject(TYPES.AuthService) authService: AuthService, @inject(TYPES.MailTransport) mailTransport: MailTransport) {
    this.authService = authService;
    this.mailTransport = mailTransport;
    this.signUp = this.signUp.bind(this);
    this.signIn = this.signIn.bind(this);
    this.signOut = this.signOut.bind(this);
    this.currenteUser = this.currenteUser.bind(this);
  }

  registerRoutes(app: Application): void {
    app.post(`/${config.API_URL}/auth/signup`, this.signUp);
    app.post(`/${config.API_URL}/auth/signin`, this.signIn);
    app.get(`/${config.API_URL}/auth/signout`, this.signOut);
    app.get(`/${config.API_URL}/auth/currentuser`, AuthGuard.authenticate, this.currenteUser);
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

    this.mailTransport.sendEmail(
      'hanna.renner@ethereal.email',
      'Confirm your email address for Winter',
      'This is a test email from development email server'
    );

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

  async currenteUser(req: Request, res: Response): Promise<Response> {
    const { currentUser, session } = req;
    if (!currentUser) {
      throw new BadRequestError('User not authenticated');
    }

    const { isUser, user } = await this.authService.currentUser(currentUser);

    const token = session?.jwt;

    return res.status(HTTP_STATUS.OK).json({
      status: 'success',
      statusCode: HTTP_STATUS.CREATED,
      message: 'Current user returned successfully',
      data: { isUser, token, user }
    });
  }
}
