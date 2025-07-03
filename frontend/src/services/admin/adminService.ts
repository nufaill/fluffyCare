// src/services/admin/adminService.ts
import AdminAxios from "@/api/admin.axios";
import axios from "axios";
import toast from 'react-hot-toast';

export const loginAdmin = async (data: { email: string; password: string }) => {
  try {
    const response = await AdminAxios.post('/login', data);
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
    await AdminAxios.post('/logout');
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
    const response = await AdminAxios.get(`/users`);

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
    const response = await AdminAxios.patch(`/users/${userId}/status`, {
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
    const response = await AdminAxios.get(`/shops`);

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

export const updateShopStatus = async (shopId: string, isActive: boolean) => {
  try {
    const response = await AdminAxios.patch(`/shops/${shopId}/status`, {
      isActive
    });

    if (response.status !== 200) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.data;
  } catch (error) {
    console.error('Failed to update shop status:', error);
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || "Failed to update status shops";
      console.error(message)
      throw new Error(message);
    } else {
      throw new Error("An unexpected error occurred.");
    }
  }
}
export const getUnverifiedShops = async () => {
  try {
    const response = await AdminAxios.get(`/verification`);

    if (response.status !== 200) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.data;
  } catch (error) {
    console.error('Failed to fetch unverified shops:', error);
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || "Failed to fetch unverified shops.";
      console.error(message);
      throw new Error(message);
    } else {
      throw new Error("An unexpected error occurred.");
    }
  }
};

export const approveShop = async (shopId: string) => {
  const loadingToast = toast.loading('Approving shop...', {
    position: 'top-right'
  });

  try {
    const response = await AdminAxios.patch(`/verification/${shopId}/approve`);

    if (response.status !== 200) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    toast.dismiss(loadingToast);
    toast.success('Shop approved successfully! ✅', {
      position: 'top-right',
      duration: 4000,
      style: {
        background: '#D1FAE5',
        color: '#059669',
        border: '1px solid #34D399'
      }
    });

    return response.data;
  } catch (error) {
    toast.dismiss(loadingToast);
    console.error('Failed to approve shop:', error);

    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || "Failed to approve shop.";
      toast.error(message, {
        position: 'top-right',
        duration: 4000,
        style: {
          background: '#FEE2E2',
          color: '#DC2626',
          border: '1px solid #F87171'
        }
      });
      throw new Error(message);
    } else {
      toast.error("An unexpected error occurred.", {
        position: 'top-right'
      });
      throw new Error("An unexpected error occurred.");
    }
  }
};

export const rejectShop = async (shopId: string, rejectionReason?: string) => {
  const loadingToast = toast.loading('Processing rejection...', {
    position: 'top-right'
  });
  
  try {
    const response = await AdminAxios.patch(`/verification/${shopId}/reject`, {
      rejectionReason
    });
    
    if (response.status !== 200) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    toast.dismiss(loadingToast);
    toast.success('Shop rejection processed successfully! ❌', {
      position: 'top-right',
      duration: 4000,
      style: {
        background: '#FEF3C7',
        color: '#D97706',
        border: '1px solid #FBBF24'
      }
    });
    
    return response.data;
  } catch (error) {
    toast.dismiss(loadingToast);
    console.error('Failed to reject shop:', error);
    
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || "Failed to reject shop.";
      toast.error(message, {
        position: 'top-right',
        duration: 4000,
        style: {
          background: '#FEE2E2',
          color: '#DC2626',
          border: '1px solid #F87171'
        }
      });
      throw new Error(message);
    } else {
      toast.error("An unexpected error occurred.", {
        position: 'top-right'
      });
      throw new Error("An unexpected error occurred.");
    }
  }
};
