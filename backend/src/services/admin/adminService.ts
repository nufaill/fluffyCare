// backend/src/services/admin/adminService.ts
import bcrypt from 'bcrypt';
import { AdminRepository } from '../../repositories/adminRepository';
import { JwtService } from '../jwt/jwtService';
import { AuthResponse } from '../../types/Admin.types';
import { ERROR_MESSAGES, HTTP_STATUS } from '../../shared/constant';
import { CustomError } from "../../util/CustomerError";

export interface LoginData {
  email: string;
  password: string;
}

export class AuthService {
  constructor(
    private adminRepository: AdminRepository,
    private jwtService: JwtService
  ) {}

  // Admin Login
  async login(loginData: LoginData): Promise<AuthResponse> {
    const { email, password } = loginData;

    // Find admin by email
    const admin = await this.adminRepository.findByEmail(email);
    if (!admin) {
      throw new CustomError(ERROR_MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      throw new CustomError(ERROR_MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED);
    }

    // Generate tokens
    const tokens = this.generateTokens(admin._id.toString(), admin.email);

    return {
      admin: {
        _id: admin._id.toString(),
        fullName: admin.fullName,
        email: admin.email
      },
      tokens
    };
  }

  // Generate JWT tokens
  generateTokens(id: string, email: string) {
    return this.jwtService.generateTokens({
      id,
      email,
      role: "admin"
    });
  }
}