// src/services/admin/adminService.ts
import adminAxios from "@/api/admin.axios";
import axios from "axios";
import toast from 'react-hot-toast';

export const loginAdmin = async (data: { email: string; password: string }) => {
  try {
    const response = await adminAxios.post('/login', data);
    if (response.data.success) {
      // Store admin data and token
      localStorage.setItem('adminToken', response.data.token);
      localStorage.setItem('adminDatas', JSON.stringify(response.data.admin));
    }
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
    toast.error(errorMessage, {
      position: 'top-right',
      duration: 4000,
      style: {
        background: '#FEE2E2',
        color: '#DC2626',
        border: '1px solid #F87171'
      }
    });
    console.error('Admin login error:', error);
    throw error;
  }
};
export const logoutAdmin = async () => {
  const loadingToast = toast.loading('Signing you out...', {
    position: 'top-right'
  });
  try {
    await adminAxios.post('/logout');
    // Clear local storage
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminDatas');
    toast.dismiss(loadingToast);
    toast.success('Logged out successfully! See you soon! 👋', {
      position: 'top-right',
      duration: 3000,
      style: {
        background: '#DBEAFE',
        color: '#1D4ED8',
        border: '1px solid #93C5FD'
      }
    });
    return { success: true };
  } catch (error) {
    toast.dismiss(loadingToast);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminDatas');

    toast.error('Logout failed, but cleared local data', {
      position: 'top-right'
    });
    console.error('Admin logout error:', error);
    return { success: true }; 
  }
};

export const getAllUsers = async () => {
  try {
      const response = await adminAxios.get(`/customer-pets-detail`);
      
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
export const updateUserStatus = async (userId: string, isActive: boolean) => {
 try {
      const response = await adminAxios.patch(`/customer-pets-detail/${userId}/status`, {
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

export const getAllShops = async () => {
  try {
      const response = await adminAxios.get(`/shops`);
      
      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.data;
    } catch (error) {
      console.error('Failed to fetch Shop:', error);
      if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message || "Failed to fetch shops.";
            console.error(message)
            throw new Error(message);
        } else {
            throw new Error("An unexpected error occurred.");
        }
    }
}