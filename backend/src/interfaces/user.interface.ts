export interface GeoLocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface IUser {
  profileImage?: string;
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  location?: GeoLocation; 
}
