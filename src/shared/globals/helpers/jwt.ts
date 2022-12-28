import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { AuthDocument, AuthPayload } from '@auth/interfaces/auth.interface';
import config from '@root/config';
import loggerHelper from './logger';
const logger = loggerHelper.create('JwtHelper');

interface JwtHelper {
  sign(authObj: AuthDocument, userId: string | ObjectId): Promise<string>;
  decode(token: string): Promise<AuthPayload>;
}

const JwtHelper: JwtHelper = {
  async sign(authObj: AuthDocument, userId: string | ObjectId): Promise<string> {
    const payload: AuthPayload = {
      userId: userId as unknown as string,
      uId: authObj.uId,
      name: authObj.name,
      username: authObj.username,
      email: authObj.email
    };

    return await jwt.sign(payload, `${config.JWT_TOKEN}`);
  },

  async decode(token: string): Promise<AuthPayload> {
    try {
      return (await jwt.verify(token, `${config.JWT_TOKEN}`)) as AuthPayload;
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }
};

export default JwtHelper;
