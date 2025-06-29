// admin.dto.ts
export interface CreateAdminDto {
  fullName: string;
  email: string;
  password: string;
}

export interface CreateShopDto {
  name: string;
  address: string;
  adminId: string;
}