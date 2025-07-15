import { Types, Document } from 'mongoose';
import { AuthResponseDto, LoginDto } from '../../dtos/admin.dto'; 
import { Admin } from 'types/admin.types';

export interface IAdminService {
  login(loginDto: LoginDto): Promise<AuthResponseDto>;
}