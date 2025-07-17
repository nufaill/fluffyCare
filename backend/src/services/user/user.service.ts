// user.service.ts
import { UserRepository } from '../../repositories/user.repository';
import { User, CreateUserData } from '../../types/User.types';
import { CustomError } from '../../util/CustomerError';
import { ERROR_MESSAGES, HTTP_STATUS } from '../../shared/constant';
import { UpdateUserDTO, NearbyUsersDTO, UsersWithinRadiusDTO } from '../../dto/user.dto';

export class UserService {
  constructor(private userRepository: UserRepository) {}

  async getAllUsers(): Promise<User[]> {
    try {
      return await this.userRepository.getAllUsers();
    } catch (error) {
      throw error instanceof CustomError ? error : new CustomError(
        ERROR_MESSAGES.USERS_FETCHED_FAILED || 'Failed to fetch users',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  async updateUserStatus(userId: string, isActive: boolean): Promise<User | null> {
    try {
      if (!userId) {
        throw new CustomError(
          ERROR_MESSAGES.ID_REQUIRED || 'User ID is required',
          HTTP_STATUS.BAD_REQUEST
        );
      }

      if (typeof isActive !== 'boolean') {
        throw new CustomError(
          ERROR_MESSAGES.IS_ACTIVE_ERROR || 'isActive must be a boolean',
          HTTP_STATUS.BAD_REQUEST
        );
      }

      const updatedUser = await this.userRepository.updateUserStatus(userId, isActive);
      
      if (!updatedUser) {
        throw new CustomError(
          ERROR_MESSAGES.USER_NOT_FOUND || 'User not found',
          HTTP_STATUS.NOT_FOUND
        );
      }

      return updatedUser;
    } catch (error) {
      throw error instanceof CustomError ? error : new CustomError(
        'Failed to update user status',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getProfile(userId: string): Promise<User> {
    try {
      if (!userId) {
        throw new CustomError(
          ERROR_MESSAGES.UNAUTH_NO_USER_FOUND || 'User ID required',
          HTTP_STATUS.UNAUTHORIZED
        );
      }

      const user = await this.userRepository.findById(userId);
      
      if (!user) {
        throw new CustomError(
          ERROR_MESSAGES.USER_NOT_FOUND || 'User not found',
          HTTP_STATUS.NOT_FOUND
        );
      }

      return user;
    } catch (error) {
      throw error instanceof CustomError ? error : new CustomError(
        ERROR_MESSAGES.PROFILE_FETCHED_FAILED || 'Failed to fetch profile',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  async updateProfile(userId: string, updateData: UpdateUserDTO): Promise<User> {
    try {
      if (!userId) {
        throw new CustomError(
          ERROR_MESSAGES.UNAUTH_NO_USER_FOUND || 'User ID required',
          HTTP_STATUS.UNAUTHORIZED
        );
      }

      const { fullName, phone, profileImage, location } = updateData;
      
      if (!fullName && !phone && !profileImage && !location) {
        throw new CustomError(
          ERROR_MESSAGES.INVALID_INPUT || 'At least one field must be provided for update',
          HTTP_STATUS.BAD_REQUEST
        );
      }

      const updatePayload: Partial<CreateUserData> = { fullName, phone, profileImage, location };
      const updatedUser = await this.userRepository.updateUser(userId, updatePayload);
      
      if (!updatedUser) {
        throw new CustomError(
          ERROR_MESSAGES.USER_NOT_FOUND || 'User not found',
          HTTP_STATUS.NOT_FOUND
        );
      }

      return updatedUser;
    } catch (error) {
      throw error instanceof CustomError ? error : new CustomError(
        ERROR_MESSAGES.PROFILE_UPDATE_FAILED || 'Failed to update profile',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findUserById(userId: string): Promise<User | null> {
    try {
      return await this.userRepository.findById(userId);
    } catch (error) {
      throw error instanceof CustomError ? error : new CustomError(
        'Failed to find user',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findUserByEmail(email: string): Promise<User | null> {
    try {
      return await this.userRepository.findByEmail(email);
    } catch (error) {
      throw error instanceof CustomError ? error : new CustomError(
        'Failed to find user by email',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findNearbyUsers(dto: NearbyUsersDTO): Promise<User[]> {
    try {
      return await this.userRepository.findNearbyUsers(dto.longitude, dto.latitude, dto.maxDistance ?? 5000);
    } catch (error) {
      throw error instanceof CustomError ? error : new CustomError(
        'Failed to find nearby users',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findUsersWithinRadius(dto: UsersWithinRadiusDTO): Promise<User[]> {
    try {
      return await this.userRepository.findUsersWithinRadius(dto.longitude, dto.latitude, dto.radiusInKm);
    } catch (error) {
      throw error instanceof CustomError ? error : new CustomError(
        'Failed to find users within radius',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }
}