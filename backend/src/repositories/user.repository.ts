import { User } from '../models/userModel';
import { CreateUserDTO, UpdateUserDTO } from '../dtos/user.dto';
import { IUser } from '../interfaces/user.interface';
import { Types } from 'mongoose';
import { CustomError } from '../util/CustomerError';
import { ERROR_MESSAGES, HTTP_STATUS } from '../shared/constant';

export class UserRepository {
  async findByEmail(email: string): Promise<IUser | null> {
    const user = await User.findOne({ email });
    if (user) {
      return { ...user.toObject(), _id: user._id.toString() } as IUser;
    }
    return null;
  }

  async findById(id: string): Promise<IUser | null> {
    const user = await User.findById(id);
    if (user) {
      return { ...user.toObject(), _id: user._id.toString() } as IUser;
    }
    return null;
  }

  async findByGoogleId(googleId: string): Promise<IUser | null> {
    const user = await User.findOne({ googleId, isActive: true });
    if (user) {
      return { ...user.toObject(), _id: user._id.toString() } as IUser;
    }
    return null;
  }

  async createUser(data: CreateUserDTO): Promise<IUser> {
    if (data.location && (!data.location.type || data.location.type !== 'Point')) {
      throw new CustomError('Location must be a valid GeoJSON Point', HTTP_STATUS.BAD_REQUEST || 400);
    }
    if (!data.location) {
      data.location = {
        type: 'Point',
        coordinates: [0, 0]
      };
    }
    const user = new User(data);
    const savedUser = await user.save();
    return { ...savedUser.toObject(), _id: savedUser._id.toString() } as IUser;
  }

  async updateUser(id: string, updateData: UpdateUserDTO): Promise<IUser | null> {
    const user = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    if (user) {
      return { ...user.toObject(), _id: user._id.toString() } as IUser;
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

  async setResetToken(email: string, token: string, expires: Date): Promise<IUser | null> {
    const user = await User.findOneAndUpdate(
      { email },
      {
        resetPasswordToken: token,
        resetPasswordExpires: expires
      },
      { new: true }
    );
    if (user) {
      return { ...user.toObject(), _id: user._id.toString() } as IUser;
    }
    return null;
  }

  async findByResetToken(token: string): Promise<IUser | null> {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    });
    if (user) {
      return { ...user.toObject(), _id: user._id.toString() } as IUser;
    }
    return null;
  }

  async updatePasswordAndClearToken(userId: Types.ObjectId, hashedPassword: string): Promise<IUser | null> {
    const user = await User.findByIdAndUpdate(
      userId,
      {
        password: hashedPassword,
        resetPasswordToken: undefined,
        resetPasswordExpires: undefined,
      },
      { new: true }
    );
    if (user) {
      return { ...user.toObject(), _id: user._id.toString() } as IUser;
    }
    return null;
  }

  async getAllUsers(): Promise<IUser[]> {
    const users = await User.find({})
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .sort({ createdAt: -1 });
    return users.map(user => ({ ...user.toObject(), _id: user._id.toString() } as IUser));
  }

  async updateUserStatus(userId: string, isActive: boolean): Promise<IUser | null> {
    const user = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true, runValidators: true }
    ).select('-password -resetPasswordToken -resetPasswordExpires');
    if (user) {
      return { ...user.toObject(), _id: user._id.toString() } as IUser;
    }
    return null;
  }

  async findNearbyUsers(longitude: number, latitude: number, maxDistance: number = 5000): Promise<IUser[]> {
    const users = await User.find({
      isActive: true,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: maxDistance // in meters
        }
      }
    }).select('-password -resetPasswordToken -resetPasswordExpires');
    return users.map(user => ({ ...user.toObject(), _id: user._id.toString() } as IUser));
  }

  async findUsersWithinRadius(longitude: number, latitude: number, radiusInKm: number): Promise<IUser[]> {
    const radiusInMeters = radiusInKm * 1000;
    const users = await User.find({
      isActive: true,
      location: {
        $geoWithin: {
          $centerSphere: [[longitude, latitude], radiusInMeters / 6378100] // Earth radius in meters
        }
      }
    }).select('-password -resetPasswordToken -resetPasswordExpires');
    return users.map(user => ({ ...user.toObject(), _id: user._id.toString() } as IUser));
  }
}