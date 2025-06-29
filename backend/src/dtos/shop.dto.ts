export interface RegisterShopDTO {
  logo: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  city: string;
  streetAddress: string;
  buildingNumber?: string;
  description?: string;
  certificateUrl: string;
  location?: object;
}

export interface LoginShopDTO {
  email: string;
  password: string;
}
