import IUserRepository from '../../interfaces/repositoryInterfaces/IUserRepository';
import { UserResponseDTO, UpdateUserDTO, CustomerAnalytics } from '../../dto/user.dto';
import { CustomError } from '../../util/CustomerError';
import { ERROR_MESSAGES, HTTP_STATUS } from '../../shared/constant';
import { IUserService } from '../../interfaces/serviceInterfaces/IUserService';

export class UserService implements IUserService {
  constructor(private _userRepository: IUserRepository) { }

  async getAllUsers(page: number = 1, limit: number = 10): Promise<{ users: UserResponseDTO[], total: number, totalPages: number }> {
    try {
      const { users, total } = await this._userRepository.getAllUsers(page, limit);
      const totalPages = Math.ceil(total / limit);
      return { users, total, totalPages };
    } catch (error) {
      throw error instanceof CustomError ? error : new CustomError(
        ERROR_MESSAGES.USERS_FETCHED_FAILED,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  async updateUserStatus(userId: string, isActive: boolean): Promise<UserResponseDTO | null> {
    try {
      if (!userId) {
        throw new CustomError(
          ERROR_MESSAGES.ID_REQUIRED,
          HTTP_STATUS.BAD_REQUEST
        );
      }

      if (typeof isActive !== 'boolean') {
        throw new CustomError(
          ERROR_MESSAGES.IS_ACTIVE_ERROR,
          HTTP_STATUS.BAD_REQUEST
        );
      }

      const updatedUser = await this._userRepository.updateUserStatus(userId, isActive);

      if (!updatedUser) {
        throw new CustomError(
          ERROR_MESSAGES.USER_NOT_FOUND,
          HTTP_STATUS.NOT_FOUND
        );
      }

      return updatedUser;
    } catch (error) {
      console.error(`Error in updateUserStatus:`, error);
      throw error instanceof CustomError ? error : new CustomError(
        'Failed to update user status',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getProfile(userId: string): Promise<UserResponseDTO> {
    try {
      if (!userId) {
        throw new CustomError(
          ERROR_MESSAGES.UNAUTH_NO_USER_FOUND,
          HTTP_STATUS.UNAUTHORIZED
        );
      }

      const user = await this._userRepository.findById(userId);

      if (!user) {
        throw new CustomError(
          ERROR_MESSAGES.USER_NOT_FOUND,
          HTTP_STATUS.NOT_FOUND
        );
      }

      return user;
    } catch (error) {
      throw error instanceof CustomError ? error : new CustomError(
        ERROR_MESSAGES.PROFILE_FETCHED_FAILED,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  async updateUser(userId: string, updateData: UpdateUserDTO): Promise<UserResponseDTO | null> {
    try {
      if (!userId) {
        throw new CustomError(
          ERROR_MESSAGES.UNAUTH_NO_USER_FOUND,
          HTTP_STATUS.UNAUTHORIZED
        );
      }

      const { fullName, phone, profileImage, location } = updateData;

      if (!fullName && !phone && !profileImage && !location) {
        throw new CustomError(
          ERROR_MESSAGES.INVALID_INPUT,
          HTTP_STATUS.BAD_REQUEST
        );
      }

      const updatedUser = await this._userRepository.updateUser(userId, updateData);

      if (!updatedUser) {
        throw new CustomError(
          ERROR_MESSAGES.USER_NOT_FOUND,
          HTTP_STATUS.NOT_FOUND
        );
      }

      return updatedUser;
    } catch (error) {
      throw error instanceof CustomError ? error : new CustomError(
        ERROR_MESSAGES.PROFILE_UPDATE_FAILED,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findById(userId: string): Promise<UserResponseDTO | null> {
    try {
      return await this._userRepository.findById(userId);
    } catch (error) {
      throw error instanceof CustomError ? error : new CustomError(
        'Failed to find user',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findUserByEmail(email: string): Promise<UserResponseDTO | null> {
    try {
      return await this._userRepository.findByEmail(email);
    } catch (error) {
      throw error instanceof CustomError ? error : new CustomError(
        'Failed to find user by email',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getCustomerAnalytics(): Promise<CustomerAnalytics> {
    try {
      return await this._userRepository.getCustomerAnalytics();
    } catch (error) {
      throw error instanceof CustomError ? error : new CustomError(
        'Failed to fetch customer analytics',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }
}