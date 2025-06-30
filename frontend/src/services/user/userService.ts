import adminAxios from "@/api/admin.axios";
import type { User } from "@/types/user.type";
import axios from "axios";


export class UserService {

  async getAllUsers(): Promise<User[]> {
    try {
      const response = await adminAxios.get(`/admin/users`);
      
      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.data;
    } catch (error) {
      console.error('Failed to fetch users:', error);
      if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message || "Failed to fetch users.";
            console.error(message)
            throw new Error(message);
        } else {
            throw new Error("An unexpected error occurred.");
        }
    }
  }

  async updateUserStatus(userId: string, isActive: boolean): Promise<User> {
    try {
      const response = await adminAxios.patch(`/admin/users/${userId}/status`, {
        isActive
      });
      
      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.data;
    } catch (error) {
      console.error('Failed to update user status:', error);
      if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message || "Failed to update status users";
            console.error(message)
            throw new Error(message);
        } else {
            throw new Error("An unexpected error occurred.");
        }
    }
  }
}