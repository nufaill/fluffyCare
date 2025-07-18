import { User } from '../models/userModel';
import { UpdateUserDTO } from '../dto/user.dto';
import { CreateUserDTO } from '../dto/auth.dto';
import { User as UserType } from '../types/User.types';
import { Types } from 'mongoose';
import { CustomError } from '../util/CustomerError';
import { HTTP_STATUS } from '../shared/constant';
import { validateGeoLocation } from '../validations/geo.validation';
import IUserRepository from '../interfaces/repositoryInterfaces/IUserRepository';

export class UserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<UserType | null> {
    const user = await User.findOne({ email });
    if (user) {
      return { ...user.toObject(), _id: user._id.toString() } as UserType;
    }
    return null;
  }

  async findById(id: string): Promise<UserType | null> {
    const user = await User.findById(id);
    if (user) {
      return { ...user.toObject(), _id: user._id.toString() } as UserType;
    }
    return null;
  }

  async findByGoogleId(googleId: string): Promise<UserType | null> {
    const user = await User.findOne({ googleId, isActive: true });
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
    const user = new User(data);
    const savedUser = await user.save();
    return { ...savedUser.toObject(), _id: savedUser._id.toString() } as UserType;
  }

  async updateUser(id: string, updateData: UpdateUserDTO): Promise<UserType | null> {
    if (updateData.location && !validateGeoLocation(updateData.location)) {
      throw new CustomError('Location must be a valid GeoJSON Point', HTTP_STATUS.BAD_REQUEST || 400);
    }
    const user = await User.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });
    if (user) {
      return { ...user.toObject(), _id: user._id.toString() } as UserType;
    }
    return null;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const user = await User.findOne({ email });
    return !!user;
  }

  async existsByGoogleId(googleId: string): Promise<boolean> {
    const user = await User.findOne({ googleId });
    return !!user;
  }

  async setResetToken(email: string, token: string, expires: Date): Promise<UserType | null> {
    const user = await User.findOneAndUpdate(
      { email },
      { resetPasswordToken: token, resetPasswordExpires: expires },
      { new: true }
    );
    if (user) {
      return { ...user.toObject(), _id: user._id.toString() } as UserType;
    }
    return null;
  }

  async findByResetToken(token: string): Promise<UserType | null> {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });
    if (user) {
      return { ...user.toObject(), _id: user._id.toString() } as UserType;
    }
    return null;
  }

  async updatePasswordAndClearToken(userId: Types.ObjectId, hashedPassword: string): Promise<UserType | null> {
    const user = await User.findByIdAndUpdate(
      userId,
      { password: hashedPassword, resetPasswordToken: undefined, resetPasswordExpires: undefined },
      { new: true }
    );
    if (user) {
      return { ...user.toObject(), _id: user._id.toString() } as UserType;
    }
    return null;
  }

  async getAllUsers(): Promise<UserType[]> {
    const users = await User.find({})
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .sort({ createdAt: -1 });
    return users.map((user) => ({ ...user.toObject(), _id: user._id.toString() } as UserType));
  }

  async updateUserStatus(userId: string, isActive: boolean): Promise<UserType | null> {
    const user = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true, runValidators: true }
    ).select('-password -resetPasswordToken -resetPasswordExpires');
    if (user) {
      return { ...user.toObject(), _id: user._id.toString() } as UserType;
    }
    return null;
  }
}