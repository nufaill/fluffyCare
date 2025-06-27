export interface RegisterUserDTO {
  profileImage?: string;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  location?: object;
}

export interface LoginUserDTO {
  email: string;
  password: string;
}
