
export interface UpdateShopStatusDTO {
  isActive: boolean;
}

export interface UpdateShopDTO {
  name?: string;
  phone?: string;
  logo?: string;
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
  city?: string;
  streetAddress?: string;
  description?: string;
}

export interface RejectShopDTO {
  rejectionReason?: string;
}