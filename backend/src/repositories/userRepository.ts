// backend/src/repositories/userRepository.ts
import { User } from '../models/userModel';
import { CreateUserData, UserDocument } from '../types/user';

export class UserRepository {
  async findByEmail(email: string): Promise<UserDocument | null> {
    return await User.findOne({ email, isActive: true });
  }

  async findById(id: string): Promise<UserDocument | null> {
    return await User.findById(id);
  }

  async findByGoogleId(googleId: string): Promise<UserDocument | null> {
    return await User.findOne({ googleId, isActive: true });
  }

  async createUser(userData: CreateUserData): Promise<UserDocument> {
    const user = new User({
      ...userData,
      isActive: userData.isActive ?? true,
      location: userData.location ?? {},
    });
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
}