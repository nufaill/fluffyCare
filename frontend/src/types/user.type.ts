export interface GeoLocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface User {
  fullName: string;
  email: string;
  phone: string;
  profileImage?: string;
  location: GeoLocation; 
  isActive: boolean;
}
