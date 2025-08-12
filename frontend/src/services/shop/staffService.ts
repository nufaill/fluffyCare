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

    async getStaff(page: number = 1, limit: number = 10): Promise<{ staff: Staff[]; total: number; page: number; limit: number; totalPages: number }> {
        try {
            const response: AxiosResponse<ApiResponse<{ staff: Staff[]; total: number; page: number; limit: number; totalPages: number }>> = await shopaxios.get(`/staff`, {
                params: { page, limit }
            });
            const data = response.data.data || { staff: [], total: 0, page: 1, limit: 10, totalPages: 1 };
            // Validate staff IDs
            data.staff.forEach((s) => {
                if (!/^[0-9a-fA-F]{24}$/.test(s._id)) {
                    console.error('Invalid staff ID in response:', s._id);
                }
            });
            return data;
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

    async toggleStaffStatus(staffId: string, isActive: boolean): Promise<ApiResponse<Staff>> {
        try {
            const response: AxiosResponse<ApiResponse<Staff>> = await shopaxios.patch(
                `/staff/${staffId}/toggle-status`,
                { isActive: !isActive }
            );
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || "Failed to toggle staff status");
        }
    }
};