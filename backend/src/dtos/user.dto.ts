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