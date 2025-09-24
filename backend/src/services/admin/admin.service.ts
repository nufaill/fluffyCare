import bcrypt from 'bcrypt';
import { IAdminRepository } from '../../interfaces/repositoryInterfaces/IAdminRepository';
import { JwtService } from '../jwt/jwt.service';
import { LoginDto, AuthResponseDto, AdminResponseDto } from '../../dto/admin.dto';
import { AdminDocument } from '../../models/admin.model';
import { ERROR_MESSAGES, HTTP_STATUS } from '../../shared/constant';
import { CustomError } from '../../util/CustomerError';
import { IAdminService } from '../../interfaces/serviceInterfaces/IAdminService';

export class AuthService implements IAdminService {
  constructor(
    private _adminRepository: IAdminRepository,
    private jwtService: JwtService
  ) { }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    const admin = await this._adminRepository.findByEmail(email);
    if (!admin) {
      throw new CustomError(ERROR_MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED);
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      throw new CustomError(ERROR_MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED);
    }

    if (!admin._id) {
      throw new CustomError('Admin document missing ID', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    const tokens = this.generateTokens(admin._id.toString(), admin.email);
    return this.mapToAuthResponseDto(admin, tokens);
  }

  private generateTokens(id: string, email: string) {
    return this.jwtService.generateTokens({
      id,
      email
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