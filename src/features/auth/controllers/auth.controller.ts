import moment from 'moment';
import publicIP from 'ip';
import { ResetPassword } from './../../user/interfaces/user.interface';
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
import { ForgotPasswordModel, ResetPasswordModel, SignInModel, SignUpModel } from '@auth/interfaces/auth.interface';
import textTransformHelper from '@globals/helpers/textTransform';
import signInSchema from '@auth/validation/signin.schema';
import AuthGuard from '@root/shared/middlewares/authguard.middleware';
import { EmailService } from '@services/emails/email.service';
import { EmailQueue, EmailQueueName } from '@services/queues/email.queue';
import { EmailTemplateService } from '@services/emails/emailTemplate.service';
import { emailSchema, resetPasswordSchema } from '@auth/validation/password.schema';

@injectable()
export default class AuthController implements RegistrableController {
  private authService: AuthService;
  private emailService: EmailService;
  private emailTemplateService: EmailTemplateService;
  private emailQueue: EmailQueue;

  constructor(
    @inject(TYPES.AuthService) authService: AuthService,
    @inject(TYPES.EmailService) emailService: EmailService,
    @inject(TYPES.EmailTemplateService) emailTemplateService: EmailTemplateService,
    @inject(TYPES.EmailQueue) emailQueue: EmailQueue
  ) {
    this.authService = authService;
    this.emailService = emailService;
    this.emailTemplateService = emailTemplateService;
    this.emailQueue = emailQueue;
    this.signUp = this.signUp.bind(this);
    this.signIn = this.signIn.bind(this);
    this.signOut = this.signOut.bind(this);
    this.forgotPassword = this.forgotPassword.bind(this);
    this.resetPassword = this.resetPassword.bind(this);
    this.currenteUser = this.currenteUser.bind(this);
  }

  registerRoutes(app: Application): void {
    app.post(`/${config.API_URL}/auth/signup`, this.signUp);
    app.post(`/${config.API_URL}/auth/signin`, this.signIn);
    app.get(`/${config.API_URL}/auth/signout`, this.signOut);
    app.post(`/${config.API_URL}/auth/forgot-password`, this.forgotPassword);
    app.post(`/${config.API_URL}/auth/reset-password/:token`, this.resetPassword);
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

    return res
      .status(HTTP_STATUS.OK)
      .json({ status: 'success', statusCode: HTTP_STATUS.OK, message: 'User signed in successfully', data: { token, user } });
  }

  async signOut(req: Request, res: Response): Promise<Response> {
    req.session = null;

    return res.status(HTTP_STATUS.OK).json({ status: 'success', statusCode: HTTP_STATUS.CREATED, message: 'User signed out successfully' });
  }

  @joiValidate(emailSchema)
  async forgotPassword(req: Request, res: Response): Promise<Response> {
    const model: ForgotPasswordModel = { ...req.body, email: textTransformHelper.toLowerCase(req.body.email) };

    const { token, user } = await this.authService.forgotPassword(model);

    // send forgot password email
    const resetLink = `${config.CLIENT_URL}/reset-password?token=${token}`;
    const template = this.emailTemplateService.getForgotPassword(user.username as string, resetLink);

    this.emailQueue.addEmailJob(EmailQueueName.FORGOT_PASSWORD, {
      receiverEmail: model.email,
      subject: 'Reset your password for Winter',
      template
    });

    return res
      .status(HTTP_STATUS.OK)
      .json({ status: 'success', statusCode: HTTP_STATUS.OK, message: 'Reset password email sent successfully' });
  }

  @joiValidate(resetPasswordSchema)
  async resetPassword(req: Request, res: Response): Promise<Response> {
    const model: ResetPasswordModel = { ...req.body };
    const { token } = req.params;
    if (!token) {
      throw new BadRequestError('Reset password token not valid');
    }

    const { user } = await this.authService.resetPassword(token, model);

    // testing reset password
    const templateParams: ResetPassword = {
      username: user.username as string,
      email: user.email as string,
      ipaddress: publicIP.address(),
      date: moment().format('DD/MM/YYYY HH:mm')
    };
    const template = this.emailTemplateService.getResetPasswordConfirmation(templateParams);

    this.emailQueue.addEmailJob(EmailQueueName.RESET_PASSWORD, {
      receiverEmail: user.email,
      subject: 'Password reset conformation for Winter',
      template
    });

    return res.status(HTTP_STATUS.OK).json({ status: 'success', statusCode: HTTP_STATUS.OK, message: 'Password updated successfully' });
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
