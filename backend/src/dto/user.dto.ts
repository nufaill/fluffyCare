export interface UpdateUserStatusDTO {
  isActive: boolean;
}

export interface UpdateUserDTO {
  fullName?: string;
  phone?: string;
  profileImage?: string;
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
}

export interface CreateUserDTO {
  fullName: string;
  email: string;
  password?: string;
  phone?: string;
  profileImage?: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  googleId?: string;
}

export interface NearbyUsersDTO {
  longitude: number;
  latitude: number;
  maxDistance?: number; 
}

export interface UsersWithinRadiusDTO {
  longitude: number;
  latitude: number;
  radiusInKm: number;
}