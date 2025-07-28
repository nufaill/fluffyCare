import shopaxios from "@/api/shop.axios";
import type { Slot } from "@/types/slot.type";
import type { AxiosResponse } from "axios";

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
  static async createSlot(slotData: Partial<Slot>): Promise<ApiResponse<Slot>> {
    try {
      const response: AxiosResponse<ApiResponse<Slot>> = await shopaxios.post("/slot/create", slotData);
      console.log("result",response.data)
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to create slot");
    }
  }

  static async getSlotById(slotId: string): Promise<ApiResponse<Slot>> {
    try {
      const response: AxiosResponse<ApiResponse<Slot>> = await shopaxios.get(`/slot/${slotId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to fetch slot");
    }
  }

  static async getSlotsByShopAndDateRange(shopId: string, query: DateRangeQuery): Promise<ApiResponse<Slot[]>> {
    try {
      const response: AxiosResponse<ApiResponse<Slot[]>> = await shopaxios.get(`/slot/shop/${shopId}/range`, {
        params: query,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to fetch slots by date range");
    }
  }

  static async getSlotsByShop(shopId: string): Promise<ApiResponse<Slot[]>> {
    try {
      const response: AxiosResponse<ApiResponse<Slot[]>> = await shopaxios.get(`/slot/shop/${shopId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to fetch slots by shop");
    }
  }

  static async updateSlot(slotId: string, updateData: Partial<Slot>): Promise<ApiResponse<Slot>> {
    try {
      const response: AxiosResponse<ApiResponse<Slot>> = await shopaxios.patch(`/slot/${slotId}`, updateData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to update slot");
    }
  }

  static async deleteSlot(slotId: string): Promise<ApiResponse<Slot>> {
    try {
      const response: AxiosResponse<ApiResponse<Slot>> = await shopaxios.delete(`/slot/${slotId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to delete slot");
    }
  }

  static async cancelSlot(slotId: string): Promise<ApiResponse<Slot>> {
    try {
      const response: AxiosResponse<ApiResponse<Slot>> = await shopaxios.patch(`/slot/${slotId}/cancel`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to cancel slot");
    }
  }

  static async getSlotsByDate(slotDate: string): Promise<ApiResponse<Slot[]>> {
    try {
      const response: AxiosResponse<ApiResponse<Slot[]>> = await shopaxios.get(`/slot/date/${slotDate}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to fetch slots by date");
    }
  }

  static async getBookedSlotsByShop(shopId: string): Promise<ApiResponse<Slot[]>> {
    try {
      const response: AxiosResponse<ApiResponse<Slot[]>> = await shopaxios.get(`/slot/shop/${shopId}/booked`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to fetch booked slots");
    }
  }
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
}