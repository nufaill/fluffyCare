import { User } from '../../models/user.model';
import { CustomerAnalytics, UpdateUserDTO, UserResponseDTO } from '../../dto/user.dto';
import { CreateUserDTO } from '../../dto/auth.dto';
import { Types } from 'mongoose';
import { CustomError } from '../../util/CustomerError';
import { HTTP_STATUS } from '../../shared/constant';
import { validateGeoLocation } from '../../validations/geo.validation';
import IUserRepository from '../../interfaces/repositoryInterfaces/IUserRepository';
import { BaseRepository } from '../base-repository/base.repository';
import { UserDocument } from '../../types/User.types';

export class UserRepository extends BaseRepository<any> implements IUserRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email: string): Promise<UserResponseDTO | null> {
    const user = await this.findOne({ email })
      .select('fullName email phone profileImage isActive createdAt updatedAt')
      .exec();
    if (user) {
      return {
        id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      } as UserResponseDTO;
    }
    return null;
  }

  async findById(id: string): Promise<UserResponseDTO | null> {
    const user = await this.model.findById(id)
      .select('fullName email phone profileImage isActive createdAt updatedAt')
      .exec();
    if (user) {
      return {
        id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      } as UserResponseDTO;
    }
    return null;
  }

  async findByGoogleId(googleId: string): Promise<UserResponseDTO | null> {
    const user = await this.findOne({ googleId, isActive: true })
      .select('fullName email phone profileImage isActive createdAt updatedAt')
      .exec();
    if (user) {
      return {
        id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      } as UserResponseDTO;
    }
    return null;
  }

  async createUser(data: CreateUserDTO): Promise<UserResponseDTO> {
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
    return {
      id: savedUser._id.toString(),
      fullName: savedUser.fullName,
      email: savedUser.email,
      phone: savedUser.phone,
      profileImage: savedUser.profileImage,
      isActive: savedUser.isActive,
      createdAt: savedUser.createdAt,
      updatedAt: savedUser.updatedAt
    } as UserResponseDTO;
  }

  async updateUser(id: string, updateData: UpdateUserDTO): Promise<UserResponseDTO | null> {
    if (updateData.location && !validateGeoLocation(updateData.location)) {
      throw new CustomError('Location must be a valid GeoJSON Point', HTTP_STATUS.BAD_REQUEST || 400);
    }
    const user = await this.updateById(id, { $set: updateData })
      .select('fullName email phone profileImage isActive createdAt updatedAt')
      .exec();
    if (user) {
      return {
        id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      } as UserResponseDTO;
    }
    return null;
  }

  async existsByEmail(email: string): Promise<boolean> {
    return await this.exists({ email });
  }

  async findByEmailWithPassword(email: string): Promise<UserDocument | null> {
    return await this.findOne({ email }).exec();
  }

  async existsByGoogleId(googleId: string): Promise<boolean> {
    return await this.exists({ googleId });
  }

  async setResetToken(email: string, token: string, expires: Date): Promise<UserResponseDTO | null> {
    const user = await this.update(
      { email },
      { resetPasswordToken: token, resetPasswordExpires: expires }
    )
      .select('fullName email phone profileImage isActive createdAt updatedAt')
      .exec();
    if (user) {
      return {
        id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      } as UserResponseDTO;
    }
    return null;
  }

  async findByResetToken(token: string): Promise<UserResponseDTO | null> {
    const user = await this.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    })
      .select('fullName email phone profileImage isActive createdAt updatedAt')
      .exec();
    if (user) {
      return {
        id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      } as UserResponseDTO;
    }
    return null;
  }

  async updatePasswordAndClearToken(userId: Types.ObjectId, hashedPassword: string): Promise<UserResponseDTO | null> {
    const user = await this.updateById(
      userId.toString(),
      { password: hashedPassword, resetPasswordToken: undefined, resetPasswordExpires: undefined }
    )
      .select('fullName email phone profileImage isActive createdAt updatedAt')
      .exec();
    if (user) {
      return {
        id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      } as UserResponseDTO;
    }
    return null;
  }

  async getAllUsers(page: number = 1, limit: number = 10): Promise<{ users: UserResponseDTO[], total: number }> {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.find({})
        .select('fullName email phone profileImage isActive createdAt updatedAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.model.countDocuments({}).exec(),
    ]);
    const mappedUsers = users.map((user) => ({
      id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      profileImage: user.profileImage,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    } as UserResponseDTO));
    return { users: mappedUsers, total };
  }

  async updateUserStatus(userId: string, isActive: boolean): Promise<UserResponseDTO | null> {
    const user = await this.updateById(userId, { isActive })
      .select('fullName email phone profileImage isActive createdAt updatedAt')
      .exec();
    if (user) {
      return {
        id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      } as UserResponseDTO;
    }
    return null;
  }

  async getCustomerAnalytics(): Promise<CustomerAnalytics> {
    const total = await this.model.countDocuments({});
    const active = await this.model.countDocuments({ isActive: true });
    const inactive = total - active;

    const now = new Date();
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const newThisMonth = await this.model.countDocuments({ createdAt: { $gte: firstDayThisMonth } });

    const chartData: { month: string; total: number; new: number; active: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = monthDate.toLocaleString('default', { month: 'short' });

      const startOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const endOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59, 999);

      const newCount = await this.model.countDocuments({
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      });

      const totalUpTo = await this.model.countDocuments({
        createdAt: { $lte: endOfMonth },
      });

      const activeUpTo = await this.model.countDocuments({
        createdAt: { $lte: endOfMonth },
        isActive: true,
      });

      chartData.push({
        month: monthName,
        total: totalUpTo,
        new: newCount,
        active: activeUpTo,
      });
    }

    return {
      total,
      active,
      inactive,
      newThisMonth,
      chartData,
    };
  }
}