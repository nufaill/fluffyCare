export interface IUser {
  profileImage?: string;
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  location?: object;
}