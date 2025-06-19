// backend/src/types/auth.types.ts
export interface UserPayload {
  id: string;
  email: string;
  role: 'user' | 'shop' | 'admin';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  success: boolean;
  user: {
    id: string;
    email: string;
    fullName: string;
    profileImage?: string;
  };
  tokens: AuthTokens;
}

export interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
  verified_email: boolean;
}

