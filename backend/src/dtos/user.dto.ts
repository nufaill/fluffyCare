export interface GeoLocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}


export interface RegisterUserDTO {
  profileImage?: string;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  location: GeoLocation; 
}

export interface LoginUserDTO {
  email: string;
  password: string;
}
