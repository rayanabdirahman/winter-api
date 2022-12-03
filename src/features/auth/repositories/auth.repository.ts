import { injectable } from 'inversify';
import { FilterQuery } from 'mongoose';
import { AuthDocument } from '@auth/interfaces/auth.interface';
import AuthModel from '@auth/models/auth.schema';

export interface AuthRepository {
  findOne(query: FilterQuery<AuthDocument>): Promise<AuthDocument | null>;
}

@injectable()
export default class AuthRepositoryImpl implements AuthRepository {
  async findOne(query: FilterQuery<AuthDocument>): Promise<AuthDocument | null> {
    return await AuthModel.findOne(query).exec();
  }
}
