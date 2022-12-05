import { injectable } from 'inversify';
import cloudinaryHelper, { CloudinaryResponseType } from '@globals/helpers/cloudinary';
import loggerHelper from '@globals/helpers/logger';
import { BadRequestError } from '@globals/helpers/errorHandler';
const logger = loggerHelper.create('CloudinaryService');

export interface CloudinaryService {
  upload(image: string, id: string): Promise<CloudinaryResponseType>;
}

@injectable()
export class CloudinaryServiceImpl implements CloudinaryService {
  async upload(image: string, id: string): Promise<CloudinaryResponseType> {
    try {
      const cloudinaryResponse = await cloudinaryHelper.upload(image, `${id}`, true, true);
      if (!cloudinaryResponse?.public_id) {
        throw new BadRequestError('Error when uploading avatar image to cloudinary. Try again');
      }

      return cloudinaryResponse;
    } catch (error) {
      logger.error(`[upload]: Unable to upload image: ${error}`);
      throw error;
    }
  }
}
