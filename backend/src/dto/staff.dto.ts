export interface createStaffDTO {
  name: string;
  email: string;
  phone: string;
}

export interface updatesStaffDTO {
  name?: string;
  email?: string;
  phone?: string;
}

export interface UpdateStaffStatusDTO {
  isActive: boolean;
}

export interface StaffResponseDTO {
  _id: string;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
}