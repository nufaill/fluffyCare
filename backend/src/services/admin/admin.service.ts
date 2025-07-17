import bcrypt from 'bcrypt';
import { AdminRepository } from '../../repositories/admin.repository';
import { JwtService } from '../jwt/jwt.service';
import { LoginDto, AuthResponseDto, AdminResponseDto } from '../../dto/admin.dto';
import { AdminDocument } from '../../models/adminModel';
import { ERROR_MESSAGES, HTTP_STATUS } from '../../shared/constant';
import { CustomError } from '../../util/CustomerError';
import { IAdminService } from '../../interfaces/serviceInterfaces/IAdminService';

export class AuthService implements IAdminService {
  constructor(
    private adminRepository: AdminRepository,
    private jwtService: JwtService
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    const admin = await this.adminRepository.findByEmail(email);
    if (!admin) {
      throw new CustomError(ERROR_MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED);
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!admin) {
      throw new CustomError(ERROR_MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED);
    }

    const tokens = this.generateTokens(admin._id.toString(), admin.email);
    return this.mapToAuthResponseDto(admin, tokens);
  }

  private generateTokens(id: string, email: string) {
    return this.jwtService.generateTokens({
      id,
      email,
      role: 'admin',
    });
  }

  private mapToAdminResponseDto(admin: AdminDocument): AdminResponseDto {
    return {
      _id: admin._id.toString(),
      fullName: admin.fullName,
      email: admin.email,
    };
  }

  private mapToAuthResponseDto(admin: AdminDocument, tokens: { accessToken: string; refreshToken: string }): AuthResponseDto {
    return {
      admin: this.mapToAdminResponseDto(admin),
      tokens,
    };
  }
}