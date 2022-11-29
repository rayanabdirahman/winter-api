import cloudinary, { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

type ResponseType = UploadApiResponse | UploadApiErrorResponse | undefined;

export interface ICloudinaryHelper {
  upload(file: string, public_id?: string, overwrite?: boolean, invalidate?: boolean): Promise<ResponseType>;
}

const cloudinaryHelper: ICloudinaryHelper = {
  upload(file: string, public_id?: string, overwrite?: boolean, invalidate?: boolean): Promise<ResponseType> {
    return new Promise((resolve) => {
      cloudinary.v2.uploader.upload(
        file,
        {
          public_id,
          overwrite,
          invalidate
        },
        (error: UploadApiErrorResponse | undefined, response: UploadApiResponse | undefined) => {
          if (error) resolve(error);
          resolve(response);
        }
      );
    });
  }
};

export default cloudinaryHelper;
