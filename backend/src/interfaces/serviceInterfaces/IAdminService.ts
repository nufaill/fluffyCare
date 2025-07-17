import { AuthResponseDto, LoginDto } from '../../dto/admin.dto';

export interface IAdminService {
  login(loginDto: LoginDto): Promise<AuthResponseDto>;
}