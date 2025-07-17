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

export interface IShopAuthService extends IGenericAuthService<
  import('../../dto/auth.dto').CreateShopDTO,
  import('../../dto/auth.dto').LoginUserDTO,
  import('../../dto/auth.dto').VerifyOtpDTO,
  import('../../dto/auth.dto').ResendOtpDTO,
  import('../../dto/auth.dto').ResetPasswordDTO,
  import('../../dto/auth.dto').SendResetLinkDTO,
  import('../../types/Shop.types').ShopAuthResponse
> {
  // Shop-specific methods
  getShopById(id: string): Promise<Omit<import('../../types/Shop.types').ShopDocument, 'password'> | null>;
}