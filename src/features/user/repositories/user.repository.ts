import { injectable } from 'inversify';
import mongoose, { FilterQuery } from 'mongoose';
import { UserDocument } from '@user/interfaces/user.interface';
import UserModel from '@user/models/user.schema';
import { ObjectId } from 'mongodb';

export interface UserRepository {
  createOne(model: UserDocument): Promise<UserDocument>;
  findOne(query: FilterQuery<UserDocument>): Promise<UserDocument | null>;
  findOneByAuthId(_id: string | ObjectId): Promise<UserDocument | null>;
  findOneById(_id: string | ObjectId): Promise<UserDocument | null>;
}

@injectable()
export default class UserRepositoryImpl implements UserRepository {
  async createOne(model: UserDocument): Promise<UserDocument> {
    return await UserModel.create(model);
  }
  async findOne(query: FilterQuery<UserDocument>): Promise<UserDocument | null> {
    return await UserModel.findOne(query).exec();
  }
  async findOneByAuthId(authId: string | ObjectId): Promise<UserDocument | null> {
    const users = await UserModel.aggregate([
      { $match: { authId: new mongoose.Types.ObjectId(authId) } },
      { $lookup: { from: 'Auth', localField: 'authId', foreignField: '_id', as: 'authId' } },
      { $unwind: '$authId' }
      // { $project: this.aggregateProject() }
    ]);
    return users?.[0];
  }
  async findOneById(_id: string | ObjectId): Promise<UserDocument | null> {
    const users = await UserModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(_id) } },
      { $lookup: { from: 'Auth', localField: 'authId', foreignField: '_id', as: 'authId' } },
      { $unwind: '$authId' },
      { $project: this.aggregateProject() }
    ]);
    return users?.[0];
  }
  async aggregateProject() {
    return {
      _id: 1,
      uId: 'authId.uId',
      username: 'authId.username',
      email: '$authId.email',
      avatarColor: '$authId.avatarColor',
      createdAt: '$authId.createdAt',
      postsCount: 1,
      blocked: 1,
      blockedBy: 1,
      followersCount: 1,
      followingCount: 1,
      notifications: 1,
      social: 1,
      bgImage: 1,
      bgImageId: 1,
      profilePicture: 1
    };
  }
}
