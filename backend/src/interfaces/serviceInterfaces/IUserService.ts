import { CreateUserData, User } from '../../types/User.types';

export interface IUserService {
  getAllUsers(): Promise<User[]>;
  updateUserStatus(userId: string, isActive: boolean): Promise<User | null>;
  findById(userId: string): Promise<User | null>;
  updateUser(userId: string, updateData: Partial<CreateUserData>): Promise<User | null>;
  getProfile(userId: string): Promise<User>;
  findUserByEmail(email: string): Promise<User | null>;
}