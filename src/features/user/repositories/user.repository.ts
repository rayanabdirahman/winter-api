import { injectable } from 'inversify';
import { FilterQuery } from 'mongoose';
import { UserDocument } from '@user/interfaces/user.interface';
import UserModel from '@user/models/user.schema';

export interface UserRepository {
  createOne(model: UserDocument): Promise<UserDocument>;
  findOne(query: FilterQuery<UserDocument>): Promise<UserDocument | null>;
}

@injectable()
export default class UserRepositoryImpl implements UserRepository {
  async createOne(model: UserDocument): Promise<UserDocument> {
    return await UserModel.create(model);
  }
  async findOne(query: FilterQuery<UserDocument>): Promise<UserDocument | null> {
    return await UserModel.findOne(query).exec();
  }
}
