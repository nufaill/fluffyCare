import shopaxios from "@/api/shop.axios";
import type { Staff, CreateStaffPayload, UpdateStaffPayload, ApiResponse } from "@/types/staff.type";
import type { AxiosResponse } from "axios";

export const StaffService = {
    async createStaff(staffData: CreateStaffPayload): Promise<ApiResponse<Staff>> {
        try {
            const response: AxiosResponse<ApiResponse<Staff>> = await shopaxios.post(
                "/staff-create",
                staffData
            );
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || "Failed to create staff");
        }
    },
    
    async getStaff(): Promise<Staff[]> {
        try {
            const response: AxiosResponse<ApiResponse<Staff[]>> = await shopaxios.get('/staff-list');
            return response.data.data || [];
            console.log("checking...",response.data.data)
        } catch (error) {
            console.error('Error fetching Staff:', error);
            throw error;
        }
    },
    
    async updateStaff(staffId: string, updateData: UpdateStaffPayload): Promise<ApiResponse<Staff>> {
        try {
            const response: AxiosResponse<ApiResponse<Staff>> = await shopaxios.patch(
                `/staff/${staffId}`,
                updateData
            );
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || "Failed to update staff");
        }
    },
    
    async toggleStaffStatus(staffId: string): Promise<ApiResponse<Staff>> {
        try {
            const response: AxiosResponse<ApiResponse<Staff>> = await shopaxios.patch(
                `/staff/${staffId}/toggle-status`
            );
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || "Failed to toggle staff status");
        }
    },

    async deleteStaff(staffId: string): Promise<ApiResponse<null>> {
        try {
            const response: AxiosResponse<ApiResponse<null>> = await shopaxios.delete(
                `/staff/${staffId}`
            );
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || "Failed to delete staff");
        }
    },
};