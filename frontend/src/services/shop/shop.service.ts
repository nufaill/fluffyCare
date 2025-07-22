// src/services/shopService/shopService.ts
import shopaxios from "@/api/shop.axios";
import type { Shop,ShopUpdatePayload, ShopApiResponse} from "@/types/shop.type";


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

  async editShop(updateData: ShopUpdatePayload): Promise<Shop> {
    try {
      const response = await shopaxios.patch<ShopApiResponse>('/profile/update', updateData);
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