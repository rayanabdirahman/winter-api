import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { AuthDocument, AuthPayload } from '@auth/interfaces/auth.interface';
import config from '@root/config';
import loggerHelper from './logger';
const logger = loggerHelper.create('JwtHelper');

interface IJwtHelper {
  sign(authObj: AuthDocument, userId: string | ObjectId): Promise<string>;
  // decode(token: string): Promise<AuthPayload>;
}

const JwtHelper: IJwtHelper = {
  async sign(authObj: AuthDocument, userId: string | ObjectId): Promise<string> {
    const payload: AuthPayload = {
      userId: userId as unknown as string,
      uId: authObj.uId,
      email: authObj.email,
      username: authObj.username,
      avatarColor: authObj.avatarColor
    };

    return await jwt.sign(payload, `${config.JWT_TOKEN}`);
  }

  // async decode(token: string): Promise<AuthPayload> {
  //   try {
  //     return (await jwt.verify(token, `${config.APP_JWT_SECRET}`)) as AuthPayload;
  //   } catch (error) {
  //     const { message } = error;
  //     logger.error(`[JwtHelper] - Unable to decode user token: ${message}`);
  //     throw message;
  //   }
  // }
};

export default JwtHelper;
