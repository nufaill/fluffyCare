export interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string | null;
  verified_email: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  profileImage?: string;
}

export interface AuthResponse {
  success: boolean;
  user: AuthUser;
  tokens: AuthTokens;
}

export interface JwtPayload {
  id: string;
  email: string;
  iat?: number;
  exp?: number;
}