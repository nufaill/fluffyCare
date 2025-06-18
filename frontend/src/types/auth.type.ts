export type SignupMode = 'user' | 'shop';

export interface UserForm {
  mode: 'user';
  profileImage: File | string | null;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  location: { lat: number; lng: number } | null;
}

export interface ShopForm {
   mode: 'shop';
  logo: File | string | null; 
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  city: string;
  streetAddress: string;
  buildingNumber: string;
  description: string;
  certificateUrl: File | string | null;
  location: { lat: number; lng: number } | null;
}

export type SignupForm = UserForm | ShopForm;

export const isShopForm = (form: SignupForm): form is ShopForm => form.mode === 'shop';
