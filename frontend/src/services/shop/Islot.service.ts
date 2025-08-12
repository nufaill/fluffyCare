import shopaxios from "@/api/shop.axios";
import type { AxiosResponse } from "axios";
import type { ShopAvailability } from "@/types/shop.type";
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface DateRangeQuery {
  startDate: string;
  endDate: string;
}

interface StaffQuery {
  sortByCreatedAt?: 'asc' | 'desc';
  createdAtFrom?: string;
  createdAtTo?: string;
}

interface StaffResponse {
  staff: { _id: string; name: string; phone: string }[];
  count: number;
}

export class SlotApiService {
  static async getStaffByShop(shopId: string, query: StaffQuery = {}): Promise<ApiResponse<StaffResponse>> {
    try {
      const response: AxiosResponse<ApiResponse<StaffResponse>> = await shopaxios.get(`/slot/${shopId}/staffCount`, {
        params: query,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to fetch staff");
    }
  }

  static async getShopAvailability(shopId: string): Promise<ApiResponse<ShopAvailability>> {
    try {
      const response: AxiosResponse<ApiResponse<ShopAvailability>> = await shopaxios.get(`/${ shopId }/availability`);
      return response.data;
    } catch (error: any) {
      console.error('GET /availability error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Failed to fetch shop availability");
    }
  }

  static async updateShopAvailability(shopId: string, data: ShopAvailability): Promise<ApiResponse<ShopAvailability>> {
    try {
      const response: AxiosResponse<ApiResponse<ShopAvailability>> = await shopaxios.put(`/${shopId}/availability`, data);
      return response.data;
    } catch (error: any) {
      console.error('PUT /availability error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Failed to update shop availability");
    }
  }
}