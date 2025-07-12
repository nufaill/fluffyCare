// admin.dto.ts
export interface CreateAdminDto {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AdminResponseDto {
  _id: string;
  fullName: string;
  email: string;
}

export interface AuthResponseDto {
  admin: AdminResponseDto;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}