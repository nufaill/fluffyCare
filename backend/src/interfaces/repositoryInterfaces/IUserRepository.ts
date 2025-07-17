import { Types } from 'mongoose';
import { CreateUserDTO } from '../../dto/auth.dto';
import { UpdateUserDTO } from '../../dto/user.dto';
import { User as UserType } from '../../types/User.types';

export interface IUserRepository {
  findByEmail(email: string): Promise<UserType | null>;
  findById(id: string): Promise<UserType | null>;
  findByGoogleId(googleId: string): Promise<UserType | null>;
  createUser(data: CreateUserDTO): Promise<UserType>;
  updateUser(id: string, updateData: UpdateUserDTO): Promise<UserType | null>;
  existsByEmail(email: string): Promise<boolean>;
  existsByGoogleId(googleId: string): Promise<boolean>;
  setResetToken(email: string, token: string, expires: Date): Promise<UserType | null>;
  findByResetToken(token: string): Promise<UserType | null>;
  updatePasswordAndClearToken(userId: Types.ObjectId, hashedPassword: string): Promise<UserType | null>;
  getAllUsers(): Promise<UserType[]>;
  updateUserStatus(userId: string, isActive: boolean): Promise<UserType | null>;
}

export default IUserRepository;