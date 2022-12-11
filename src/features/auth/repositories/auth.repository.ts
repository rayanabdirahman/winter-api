import { injectable } from 'inversify';
import { FilterQuery, UpdateQuery } from 'mongoose';
import { AuthDocument } from '@auth/interfaces/auth.interface';
import AuthModel from '@auth/models/auth.schema';

export interface AuthRepository {
  createOne(model: AuthDocument): Promise<AuthDocument>;
  findOne(query: FilterQuery<AuthDocument>): Promise<AuthDocument | null>;
  findOneByEmail(email: string): Promise<AuthDocument | null>;
  updateOneById(_id: string, query: UpdateQuery<AuthDocument>): Promise<void>;
}

@injectable()
export default class AuthRepositoryImpl implements AuthRepository {
  async createOne(model: AuthDocument): Promise<AuthDocument> {
    return await AuthModel.create(model);
  }
  async findOne(query: FilterQuery<AuthDocument>): Promise<AuthDocument | null> {
    return await AuthModel.findOne(query).exec();
  }
  async findOneByEmail(email: string): Promise<AuthDocument | null> {
    return await AuthModel.findOne({ email }).exec();
  }
  async updateOneById(_id: string, query: UpdateQuery<AuthDocument>): Promise<void> {
    await AuthModel.updateOne({ _id }, query);
  }
}
