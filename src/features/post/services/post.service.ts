import { injectable } from 'inversify';

export interface PostService {
  createOneWithoutImg(model: any): Promise<any>;
}

@injectable()
export default class PostServiceImpl implements PostService {
  async createOneWithoutImg(model: any): Promise<any> {
    return 'post service';
  }
}
