import { ShopResponseDTO } from '../../dto/shop.dto';
import { ShopAuthResponse } from '../../types/Shop.types';
import { CreateShopDTO, VerifyOtpDTO, ResendOtpDTO, LoginUserDTO, SendResetLinkDTO, ResetPasswordDTO } from '../../dto/auth.dto';

export interface IGenericAuthService<
  TRegisterDTO,
  TLoginDTO,
  TVerifyOtpDTO,
  TResendOtpDTO,
  TResetPasswordDTO,
  TSendResetLinkDTO,
  TAuthResponse,
  TRegisterResponse = { email: string }
> {
  // Registration flow
  register(data: TRegisterDTO): Promise<TRegisterResponse>;
  verifyOtpAndCompleteRegistration(data: TVerifyOtpDTO): Promise<TAuthResponse>;
  resendOtp(data: TResendOtpDTO): Promise<void>;
  
  // Authentication
  login(data: TLoginDTO): Promise<TAuthResponse>;
  refreshToken(refreshToken: string): Promise<string>;
  
  // Password reset
  sendResetLink(data: TSendResetLinkDTO): Promise<void>;
  resetPassword(data: TResetPasswordDTO): Promise<void>;
}

// Specialized interfaces for User and Shop
export interface IUserAuthService extends IGenericAuthService<
  import('../../dto/auth.dto').RegisterUserDTO,
  import('../../dto/auth.dto').LoginUserDTO,
  { email: string; otp: string },
  { email: string },
  import('../../dto/auth.dto').ResetPasswordDTO,
  { email: string },
  import('../../types/auth.types').AuthResponse
> {
  // User-specific methods
  googleLogin(credential: string): Promise<import('../../types/auth.types').AuthResponse>;
}

export interface IShopAuthService {
  register(shopData: CreateShopDTO): Promise<{ email: string }>;
  verifyOtpAndCompleteRegistration(data: VerifyOtpDTO): Promise<ShopAuthResponse>;
  resendOtp(data: ResendOtpDTO): Promise<void>;
  login(data: LoginUserDTO): Promise<ShopAuthResponse>;
  refreshToken(refreshToken: string): Promise<string>;
  sendResetLink(data: SendResetLinkDTO): Promise<void>;
  resetPassword(data: ResetPasswordDTO): Promise<void>;
  getShopById(id: string): Promise<ShopResponseDTO | null>; 
}