import { ObjectId } from 'mongodb';
import { BadRequestError } from './../../../shared/globals/helpers/errorHandler';
import { AuthDocument, SignUpModel } from '@auth/interfaces/auth.interface';
import { inject, injectable } from 'inversify';
import { AuthRepository } from '@auth/repositories/auth.repository';
import TYPES from '@root/types';
import loggerHelper from '@globals/helpers/logger';
import textTransformHelper from '@globals/helpers/textTransform';
import cloudinaryHelper from '@globals/helpers/cloudinary';
import nanoIdHelper from '@globals/helpers/nanoId';
const logger = loggerHelper.create('[AuthService]');

export interface AuthService {
  signUp(model: SignUpModel): Promise<AuthDocument>;
}

@injectable()
export default class AuthServiceImpl implements AuthService {
  private authRepository: AuthRepository;

  constructor(@inject(TYPES.AuthRepository) authRepository: AuthRepository) {
    this.authRepository = authRepository;
  }

  async signUp(model: SignUpModel): Promise<AuthDocument> {
    try {
      // check if username or email is taken
      const isUserTaken = await this.isUsernameOrEmailTaken(model.username, model.email);
      if (isUserTaken) {
        throw new BadRequestError('A user with these credentials already exists');
      }

      const userId = new ObjectId();

      const authDocument = {
        ...model,
        _id: new ObjectId(),
        uId: nanoIdHelper.generateInt(),
        username: textTransformHelper.capitaliseFirstLetter(model.username),
        email: textTransformHelper.toLowerCase(model.email),
        createdAt: new Date()
      } as unknown as AuthDocument;

      const cloudinaryResponse = await cloudinaryHelper.upload(model.avatarImage, `${userId}`, true, true);
      if (!cloudinaryResponse?.public_id) {
        throw new BadRequestError('Error when uploading avatar image to cloudinary. Try again');
      }

      return model as any;
    } catch (error) {
      logger.error(`[UserService: signUp]: Unabled to create user: ${error}`);
      throw error;
    }
  }

  private async isUsernameOrEmailTaken(username: string, email: string): Promise<boolean> {
    const user = await this.authRepository.findOne({
      $or: [{ username: textTransformHelper.capitaliseFirstLetter(username) }, { email: textTransformHelper.toLowerCase(email) }]
    });
    return user ? Promise.resolve(true) : Promise.resolve(false);
  }
}
