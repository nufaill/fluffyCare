// user.repository.ts
import { User } from '../models/userModel';
import { UpdateUserDTO } from '../dtos/user.dto';
import { CreateUserDTO } from '../dtos/auth.dto';
import { User as UserType } from '../types/User.types';
import { Types } from 'mongoose';
import { CustomError } from '../util/CustomerError';
import { ERROR_MESSAGES, HTTP_STATUS } from '../shared/constant';
import { validateGeoLocation } from '../validations/geo.validation';

export class UserRepository {
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

  async findNearbyUsers(longitude: number, latitude: number, maxDistance: number = 5000): Promise<UserType[]> {
    const users = await User.find({
      isActive: true,
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [longitude, latitude] },
          $maxDistance: maxDistance,
        },
      },
    }).select('-password -resetPasswordToken -resetPasswordExpires');
    return users.map((user) => ({ ...user.toObject(), _id: user._id.toString() } as UserType));
  }

  async findUsersWithinRadius(longitude: number, latitude: number, radiusInKm: number): Promise<UserType[]> {
    const radiusInMeters = radiusInKm * 1000;
    const users = await User.find({
      isActive: true,
      location: {
        $geoWithin: {
          $centerSphere: [[longitude, latitude], radiusInMeters / 6378100],
        },
      },
    }).select('-password -resetPasswordToken -resetPasswordExpires');
    return users.map((user) => ({ ...user.toObject(), _id: user._id.toString() } as UserType));
  }
}