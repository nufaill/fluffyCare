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

export interface UserDocument {
  _id: string
  fullName: string
  email: string
  password?: string
  profileImage: string
  phone?: string
  location:GeoLocation;
  isActive: boolean
  googleId?: string
  resetPasswordToken?: string
  resetPasswordExpires?: Date
  createdAt: Date
  updatedAt: Date
}