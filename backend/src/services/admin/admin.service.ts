import bcrypt from 'bcrypt';
import { AdminRepository } from '../../repositories/admin.repository';
import { JwtService } from '../jwt/jwt.service';
import { CreateAdminDto, LoginDto, AuthResponseDto, AdminResponseDto } from '../../dtos/admin.dto';
import { Admin } from '../../interfaces/admin.interface';
import { AdminDocument } from '../../models/adminModel';
import { ERROR_MESSAGES, HTTP_STATUS } from '../../shared/constant';
import { CustomError } from '../../util/CustomerError';

export class AuthService {
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
    if (!isPasswordValid) {
      throw new CustomError(ERROR_MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED);
    }

    const tokens = this.generateTokens(admin._id.toString(), admin.email);
    return this.mapToAuthResponseDto(admin, tokens);
  }

  async createAdmin(createAdminDto: CreateAdminDto): Promise<AdminResponseDto> {
    const existingAdmin = await this.adminRepository.findByEmail(createAdminDto.email);
    if (existingAdmin) {
      throw new CustomError(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS, HTTP_STATUS.BAD_REQUEST);
    }

    const adminEntity: Partial<Admin> = {
      fullName: createAdminDto.fullName,
      email: createAdminDto.email,
      password: createAdminDto.password,
    };

    const admin = await this.adminRepository.create(adminEntity);
    return this.mapToAdminResponseDto(admin);
  }

  async updateAdmin(id: string, updateAdminDto: Partial<CreateAdminDto>): Promise<AdminResponseDto> {
    const admin = await this.adminRepository.findById(id);
    if (!admin) {
      throw new CustomError(ERROR_MESSAGES.ADMIN_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    const updateData: Partial<Admin> = {};
    if (updateAdminDto.fullName) updateData.fullName = updateAdminDto.fullName;
    if (updateAdminDto.email) updateData.email = updateAdminDto.email;
    if (updateAdminDto.password) updateData.password = updateAdminDto.password;

    const updatedAdmin = await this.adminRepository.update(id, updateData);
    if (!updatedAdmin) {
      throw new CustomError(ERROR_MESSAGES.ADMIN_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    return this.mapToAdminResponseDto(updatedAdmin);
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