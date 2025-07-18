
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
   location?: {
    type: 'Point';
    coordinates: [number, number];
  };
}

export interface AuthResponse {
  success: boolean;
  user: AuthUser;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture: string | null;
  verified_email: boolean;
}
