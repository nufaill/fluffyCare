export interface User {
  fullName: string;
  email: string;
  phone?: string;
  profileImage?: string;
  location?: Record<string, any>;
  isActive: boolean;
}