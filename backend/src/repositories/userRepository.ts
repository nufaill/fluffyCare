// backend/src/repositories/userRepository.ts
import { User } from '../models/userModel';
import { CreateUserData, UserDocument } from '../types/User.types';
import { Types } from 'mongoose';


export class UserRepository {
  async findByEmail(email: string): Promise<UserDocument | null> {
    console.log("🔍 Searching user by email:", email);
    const user = await User.findOne({ email });
    console.log("📦 Found user:", user);
    return user;
  }


  async findById(id: string): Promise<UserDocument | null> {
    return await User.findById(id);
  }

  async findByGoogleId(googleId: string): Promise<UserDocument | null> {
    return await User.findOne({ googleId, isActive: true });
  }

  async createUser(data: CreateUserData): Promise<UserDocument> {
    if (data.location && (!data.location.type || data.location.type !== 'Point')) {
      throw new Error('Location must be a valid GeoJSON Point');
    }
    if (!data.location) {
      data.location = {
        type: 'Point',
        coordinates: [0, 0]
      };
    }
    const user = new User(data);
    return await user.save();
  }

  async updateUser(id: string, updateData: Partial<CreateUserData>): Promise<UserDocument | null> {
    return await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
  }

  async existsByEmail(email: string): Promise<boolean> {
    const user = await User.findOne({ email });
    return !!user;
  }

  async existsByGoogleId(googleId: string): Promise<boolean> {
    const user = await User.findOne({ googleId });
    return !!user;
  }
  async setResetToken(email: string, token: string, expires: Date): Promise<UserDocument | null> {
    console.log("🔧 [UserRepository] Setting reset token for email:", email);
    return await User.findOneAndUpdate(
      { email },
      {
        resetPasswordToken: token,
        resetPasswordExpires: expires
      },
      { new: true }
    );
  }

  async findByResetToken(token: string): Promise<UserDocument | null> {
    console.log("🔧 [UserRepository] Finding user by reset token");
    return await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    });
  }

  async updatePasswordAndClearToken(userId: Types.ObjectId, hashedPassword: string): Promise<UserDocument | null> {
    console.log("🔧 [UserRepository] Updating password and clearing reset token");
    return await User.findByIdAndUpdate(
      userId,
      {
        password: hashedPassword,
        resetPasswordToken: undefined,
        resetPasswordExpires: undefined,
      },
      { new: true }
    );
  }
  async getAllUsers(): Promise<UserDocument[]> {
    return await User.find({})
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .sort({ createdAt: -1 });
  }

  async updateUserStatus(userId: string, isActive: boolean): Promise<UserDocument | null> {
    return await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true, runValidators: true }
    ).select('-password -resetPasswordToken -resetPasswordExpires');
  }

  async findNearbyUsers(longitude: number, latitude: number, maxDistance: number = 5000): Promise<UserDocument[]> {
    return await User.find({
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
  }

  async findUsersWithinRadius(longitude: number, latitude: number, radiusInKm: number): Promise<UserDocument[]> {
    const radiusInMeters = radiusInKm * 1000;

    return await User.find({
      isActive: true,
      location: {
        $geoWithin: {
          $centerSphere: [[longitude, latitude], radiusInMeters / 6378100] // Earth radius in meters
        }
      }
    }).select('-password -resetPasswordToken -resetPasswordExpires');
  }

}

