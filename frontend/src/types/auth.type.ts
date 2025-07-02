export type SignupMode = 'user' | 'shop';

//  GeoJSON location type
export interface GeoLocation {
  type: 'Point';
  coordinates: [number, number]; 
}

export interface UserForm {
  mode: 'user';
  profileImage: File | string | null;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  location: GeoLocation | null;
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
  description: string;
  certificateUrl: File | string | null;
  location: GeoLocation | null;
}

export type SignupForm = UserForm | ShopForm;

export const isShopForm = (form: SignupForm): form is ShopForm => form.mode === 'shop';
