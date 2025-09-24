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
  }; 
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerAnalytics {
  total: number;
  active: number;
  inactive: number;
  newThisMonth: number;
  chartData: Array<{ month: string; total: number; new: number; active: number }>;
}