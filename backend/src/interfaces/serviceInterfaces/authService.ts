// authService.ts
import { RegisterUserDTO, LoginUserDTO } from '../../dto/auth.dto';
import { CreateUserData } from '../../types/User.types';
import { AuthResponse } from '../../types/auth.types';

export interface IAuthService {
  register(userData: RegisterUserDTO): Promise<{ email: string }>;
  verifyOtpAndCompleteRegistration(email: string, otp: string): Promise<{ user: CreateUserData; tokens: { accessToken: string; refreshToken: string } }>;
  resendOtp(email: string): Promise<void>;
  login(loginData: LoginUserDTO): Promise<AuthResponse>;
  googleLogin(credential: string): Promise<AuthResponse>;
  refreshToken(refreshToken: string): Promise<string>;
  sendResetLink(email: string): Promise<void>;
  resetPassword(token: string, password: string, confirmPassword: string): Promise<void>;
}