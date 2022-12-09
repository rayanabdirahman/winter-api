import { injectable } from 'inversify';
import { BadRequestError } from './../../globals/helpers/errorHandler';
import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import sendGridMail from '@sendgrid/mail';
import config from '@root/config';
import loggerHelper from '@globals/helpers/logger';
const logger = loggerHelper.create('MailTransportService');

sendGridMail.setApiKey(config.SENDGRID_API_KEY as string);

interface MailOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
}

export interface MailTransport {
  sendEmail(recieverEmail: string, subject: string, body: string): Promise<void>;
}

@injectable()
export default class MailTransportImpl implements MailTransport {
  async sendEmail(recieverEmail: string, subject: string, body: string): Promise<void> {
    if (config.NODE_ENV === 'test' || config.NODE_ENV === 'development') {
      this.developmentEmailServer(recieverEmail, subject, body);
    } else {
      this.productionEmailServer(recieverEmail, subject, body);
    }
  }

  private async developmentEmailServer(recieverEmail: string, subject: string, body: string): Promise<void> {
    try {
      // create reusable transporter object using the default SMTP transport
      const transporter: Mail = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: config.SENDER_EMAIL,
          pass: config.SENDER_EMAIL_PASSWORD
        }
      });

      // defined transport object
      const options: MailOptions = {
        from: `Winter <${config.SENDER_EMAIL}>`,
        to: recieverEmail,
        subject,
        html: body
      };

      await transporter.sendMail(options);
      logger.info('[DEV EMAIL]: sent successfully');
    } catch (error) {
      logger.error('Error sending email: ', error);
      throw new BadRequestError('Error when sending email');
    }
  }

  private async productionEmailServer(recieverEmail: string, subject: string, body: string): Promise<void> {
    try {
      // defined transport object
      const options: MailOptions = {
        from: `Winter <${config.SENDER_EMAIL}>`,
        to: recieverEmail,
        subject,
        html: body
      };

      await sendGridMail.send(options);
      logger.info('[PROD EMAIL]: sent successfully');
    } catch (error) {
      logger.error('Error sending email: ', error);
      throw new BadRequestError('Error when sending email');
    }
  }
}
