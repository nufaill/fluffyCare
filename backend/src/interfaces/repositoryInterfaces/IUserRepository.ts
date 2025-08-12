import { UserResponseDTO } from '../../dto/user.dto';

export default interface IUserRepository {
  findByEmail(email: string): Promise<UserResponseDTO | null>;
  findById(id: string): Promise<UserResponseDTO | null>;
  findByGoogleId(googleId: string): Promise<UserResponseDTO | null>;
  createUser(data: any): Promise<UserResponseDTO>;
  updateUser(id: string, updateData: any): Promise<UserResponseDTO | null>;
  existsByEmail(email: string): Promise<boolean>;
  existsByGoogleId(googleId: string): Promise<boolean>;
  setResetToken(email: string, token: string, expires: Date): Promise<UserResponseDTO | null>;
  findByResetToken(token: string): Promise<UserResponseDTO | null>;
  updatePasswordAndClearToken(userId: any, hashedPassword: string): Promise<UserResponseDTO | null>;
  getAllUsers(page?: number, limit?: number): Promise<{ users: UserResponseDTO[]; total: number }>;
  updateUserStatus(userId: string, isActive: boolean): Promise<UserResponseDTO | null>;
}