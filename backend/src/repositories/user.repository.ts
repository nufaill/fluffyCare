import { User } from '../models/user.model';
import { UpdateUserDTO } from '../dto/user.dto';
import { CreateUserDTO } from '../dto/auth.dto';
import { User as UserType } from '../types/User.types';
import { Types } from 'mongoose';
import { CustomError } from '../util/CustomerError';
import { HTTP_STATUS } from '../shared/constant';
import { validateGeoLocation } from '../validations/geo.validation';
import IUserRepository from '../interfaces/repositoryInterfaces/IUserRepository';
import { BaseRepository } from './base-repository/base.repository';

export class UserRepository extends BaseRepository<any> implements IUserRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email: string): Promise<UserType | null> {
    const user = await this.findOne({ email }).exec();
    if (user) {
      return { ...user.toObject(), _id: user._id.toString() } as UserType;
    }
    return null;
  }

  async findById(id: string): Promise<UserType | null> {
    const user = await super.findById(id);
    if (user) {
      return { ...user.toObject(), _id: user._id.toString() } as UserType;
    }
    return null;
  }

  async findByGoogleId(googleId: string): Promise<UserType | null> {
    const user = await this.findOne({ googleId, isActive: true }).exec();
    if (user) {
      return { ...user.toObject(), _id: user._id.toString() } as UserType;
    }
    return null;
  }

  async createUser(data: CreateUserDTO): Promise<UserType> {
    if (data.location && !validateGeoLocation(data.location)) {
      throw new CustomError('Location must be a valid GeoJSON Point', HTTP_STATUS.BAD_REQUEST || 400);
    }
    if (!data.location) {
      data.location = {
        type: 'Point',
        coordinates: [0, 0],
      };
    }
    const savedUser = await this.create(data);
    return { ...savedUser.toObject(), _id: savedUser._id.toString() } as UserType;
  }

  async updateUser(id: string, updateData: UpdateUserDTO): Promise<UserType | null> {
    if (updateData.location && !validateGeoLocation(updateData.location)) {
      throw new CustomError('Location must be a valid GeoJSON Point', HTTP_STATUS.BAD_REQUEST || 400);
    }
    const user = await this.updateById(id, { $set: updateData }).exec();
    if (user) {
      return { ...user.toObject(), _id: user._id.toString() } as UserType;
    }
    return null;
  }

  async existsByEmail(email: string): Promise<boolean> {
    return await this.exists({ email });
  }

  async existsByGoogleId(googleId: string): Promise<boolean> {
    return await this.exists({ googleId });
  }

  async setResetToken(email: string, token: string, expires: Date): Promise<UserType | null> {
    const user = await this.update(
      { email },
      { resetPasswordToken: token, resetPasswordExpires: expires }
    ).exec();
    if (user) {
      return { ...user.toObject(), _id: user._id.toString() } as UserType;
    }
    return null;
  }

  async findByResetToken(token: string): Promise<UserType | null> {
    const user = await this.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    }).exec();
    if (user) {
      return { ...user.toObject(), _id: user._id.toString() } as UserType;
    }
    return null;
  }

  async updatePasswordAndClearToken(userId: Types.ObjectId, hashedPassword: string): Promise<UserType | null> {
    const user = await this.updateById(
      userId.toString(),
      { password: hashedPassword, resetPasswordToken: undefined, resetPasswordExpires: undefined }
    ).exec();
    if (user) {
      return { ...user.toObject(), _id: user._id.toString() } as UserType;
    }
    return null;
  }

  async getAllUsers(): Promise<UserType[]> {
    const users = await this.find({})
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .sort({ createdAt: -1 })
      .exec();
    return users.map((user) => ({ ...user.toObject(), _id: user._id.toString() } as UserType));
  }

  async updateUserStatus(userId: string, isActive: boolean): Promise<UserType | null> {
    const user = await this.updateById(userId, { isActive })
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .exec();
    if (user) {
      return { ...user.toObject(), _id: user._id.toString() } as UserType;
    }
    return null;
  }
}