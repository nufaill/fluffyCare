import { GeoLocation } from '../dtos/user.dto';

export interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  profileImage?: string;
  location?: GeoLocation;
}

export interface AuthResponse {
  success: boolean;
  user: AuthUser;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}