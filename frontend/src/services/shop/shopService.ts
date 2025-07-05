// src/services/shopService/shopService.ts
import shopaxios from "@/api/shop.axios";
import type { Shop } from "@/types/shop.type";

export interface ShopUpdatePayload {
  name?: string;
  phone?: string;
  city?: string;
  streetAddress?: string;
  description?: string;
  logo?: string;
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
}

export interface ShopApiResponse {
  success: boolean;
  data: {
    id: string;
    name: string;
    email: string;
    phone: string;
    city: string;
    streetAddress: string;
    description: string;
    logo: string;
    certificateUrl: string;
    location: {
      type: 'Point';
      coordinates: [number, number];
    };
    isActive: boolean;
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
  };
  message: string;
}

export const shopService = {
  async getShop(shopId: string): Promise<Shop> {
    try {
      const response = await shopaxios.get<ShopApiResponse>(`/profile/${shopId}`);
      const data = response.data.data;

      return {
        _id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        city: data.city,
        streetAddress: data.streetAddress,
        description: data.description,
        logo: data.logo,
        certificateUrl: data.certificateUrl,
        location: data.location,
        isVerified: data.isVerified,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };
    } catch (error) {
      console.error('Error fetching shop profile:', error);
      throw error;
    }
  },

  async editShop(shopId: string, updateData: ShopUpdatePayload): Promise<Shop> {
    try {
      const response = await shopaxios.patch<ShopApiResponse>(`/profile/update/${shopId}`, updateData);
      const data = response.data.data;

      return {
        _id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        city: data.city,
        streetAddress: data.streetAddress,
        description: data.description,
        logo: data.logo,
        certificateUrl: data.certificateUrl,
        location: data.location,
        isVerified: data.isVerified,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };
    } catch (error) {
      console.error('Error updating shop profile:', error);
      throw error;
    }
  },
};