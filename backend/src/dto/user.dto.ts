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

export interface UserResponseDTO {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  profileImage?: string;
  location?: {
    type: 'Point';
    coordinates: [number, number];
  }; // Added to match UserProfile
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// export interface NearbyUsersDTO {
//   longitude: number;
//   latitude: number;
//   maxDistance?: number; 
// }

// export interface UsersWithinRadiusDTO {
//   longitude: number;
//   latitude: number;
//   radiusInKm: number;
// }

export interface CustomerAnalytics {
  total: number;
  active: number;
  inactive: number;
  newThisMonth: number;
  chartData: Array<{ month: string; total: number; new: number; active: number }>;
}