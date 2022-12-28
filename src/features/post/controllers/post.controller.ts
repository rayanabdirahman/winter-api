import { inject, injectable } from 'inversify';
import { Application, Request, Response } from 'express';
import { RegistrableController } from '@root/features/registrable.controller';
import config from '@root/config';
import TYPES from '@root/types';
import { OKResponse } from '@globals/helpers/apiResponse';
import joiValidate from '@globals/decorators/joi.decorator';
import { postSchema } from '@post/validation';

@injectable()
export default class PostController implements RegistrableController {
  constructor() {
    this.createOne = this.createOne.bind(this);
  }

  registerRoutes(app: Application): void {
    app.post(`/${config.API_URL}/post`, this.createOne);
  }

  @joiValidate(postSchema)
  async createOne(req: Request, res: Response): Promise<Response> {
    return OKResponse(res, 'Created post successfully');
  }
}
