import { UserResponseDTO, UpdateUserDTO } from '../../dto/user.dto';

export interface IUserService {
  getAllUsers(page?: number, limit?: number): Promise<{ users: UserResponseDTO[]; total: number; totalPages: number }>;
  updateUserStatus(userId: string, isActive: boolean): Promise<UserResponseDTO | null>;
  getProfile(userId: string): Promise<UserResponseDTO>;
  updateUser(userId: string, updateData: UpdateUserDTO): Promise<UserResponseDTO | null>;
  findById(userId: string): Promise<UserResponseDTO | null>;
  findUserByEmail(email: string): Promise<UserResponseDTO | null>;
}