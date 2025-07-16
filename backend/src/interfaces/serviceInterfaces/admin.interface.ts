import { AuthResponseDto, LoginDto } from '../../dtos/admin.dto'; 

export interface IAdminService {
  login(loginDto: LoginDto): Promise<AuthResponseDto>;
}