// src/services/admin/adminService.ts
import AdminAxios from "@/api/admin.axios";
import axios from "axios";
import toast from 'react-hot-toast';

export const loginAdmin = async (data: { email: string; password: string }) => {
  try {
    const response = await AdminAxios.post('/login', data);
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
    const response = await AdminAxios.get(`/unverified`);

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
    const response = await AdminAxios.patch(`/unverified/${shopId}/approve`);

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
      throw new Error("An unexpected error occurred.");
    }
  }
};

export const rejectShop = async (shopId: string, rejectionReason?: string) => {
  const loadingToast = toast.loading('Processing rejection...', {
    position: 'top-right'
  });

  try {
    const response = await AdminAxios.patch(`/unverified/${shopId}/reject`, {
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
      throw new Error("An unexpected error occurred.");
    }
  }
};

export const createPetType = async (data: { name: string }) => {
  const loadingToast = toast.loading('Creating pet type...', {
    position: 'top-right'
  });

  try {
    // Fetch existing pet types to check for duplicates
    const petTypesResponse = await getAllPetTypes();
    if (petTypesResponse.success) {
      const existingPetTypes = petTypesResponse.data;
      const nameExists = existingPetTypes.some(
        (petType: { name: string }) => petType.name.toLowerCase() === data.name.toLowerCase()
      );

      if (nameExists) {
        toast.dismiss(loadingToast);
        toast.error('Pet type with this name already exists.', {
          position: 'top-right',
          duration: 4000,
          style: {
            background: '#FEE2E2',
            color: '#DC2626',
            border: '1px solid #F87171'
          }
        });
        throw new Error('Pet type with this name already exists.');
      }
    }

    const response = await AdminAxios.post('/pet-types', data);

    if (response.status !== 201) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    toast.dismiss(loadingToast);
    toast.success('Pet type created successfully! 🐾', {
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
    console.error('Failed to create pet type:', error);

    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || "Failed to create pet type.";
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
      throw new Error("An unexpected error occurred.");
    }
  }
};

export const getAllPetTypes = async () => {
  try {
    const response = await AdminAxios.get('/pet-types');

    if (response.status !== 200) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.data;
  } catch (error) {
    console.error('Failed to fetch pet types:', error);
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || "Failed to fetch pet types.";
      console.error(message);
      throw new Error(message);
    } else {
      throw new Error("An unexpected error occurred.");
    }
  }
};

export const updatePetType = async (id: string, data: { name: string }) => {
  const loadingToast = toast.loading('Updating pet type...', {
    position: 'top-right'
  });

  try {
    const response = await AdminAxios.put(`/pet-types/${id}`, data);

    if (response.status !== 200) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    toast.dismiss(loadingToast);
    toast.success('Pet type updated successfully! ✏️', {
      position: 'top-right',
      duration: 4000,
      style: {
        background: '#DBEAFE',
        color: '#1D4ED8',
        border: '1px solid #93C5FD'
      }
    });

    return response.data;
  } catch (error) {
    toast.dismiss(loadingToast);
    console.error('Failed to update pet type:', error);

    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || "Failed to update pet type.";
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
      throw new Error("An unexpected error occurred.");
    }
  }
};

export const updatePetTypeStatus = async (id: string, isActive: boolean) => {
  const action = isActive ? 'Activating' : 'Blocking';
  const loadingToast = toast.loading(`${action} pet type...`, {
    position: 'top-right'
  });

  try {
    const response = await AdminAxios.patch(`/pet-types/${id}/status`, {
      isActive
    });

    if (response.status !== 200) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    toast.dismiss(loadingToast);
    toast.success(`Pet type ${isActive ? 'activated' : 'blocked'} successfully! ${isActive ? '✅' : '❌'}`, {
      position: 'top-right',
      duration: 4000,
      style: {
        background: isActive ? '#D1FAE5' : '#FEF3C7',
        color: isActive ? '#059669' : '#D97706',
        border: `1px solid ${isActive ? '#34D399' : '#FBBF24'}`
      }
    });

    return response.data;
  } catch (error) {
    toast.dismiss(loadingToast);
    console.error('Failed to update pet type status:', error);

    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || "Failed to update pet type status.";
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
      throw new Error("An unexpected error occurred.");
    }
  }
};

export const createServiceType = async (data: { name: string }) => {
  const loadingToast = toast.loading('Creating Service type...', {
    position: 'top-right'
  });

  try {
    const serviceTypesResponse = await getAllServiceTypes();
    if (serviceTypesResponse.success) {
      const existingServiceTypes = serviceTypesResponse.data;
      const nameExists = existingServiceTypes.some(
        (serviceType: { name: string }) => serviceType.name.toLowerCase() === data.name.toLowerCase()
      );

      if (nameExists) {
        toast.dismiss(loadingToast);
        toast.error('Service type with this name already exists.', {
          position: 'top-right',
          duration: 4000,
          style: {
            background: '#FEE2E2',
            color: '#DC2626',
            border: '1px solid #F87171'
          }
        });
        throw new Error('Service type with this name already exists.');
      }
    }

    const response = await AdminAxios.post('/service-types', data);

    if (response.status !== 201) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    toast.dismiss(loadingToast);
    toast.success('Service type created successfully! 🐾', {
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
    console.error('Failed to create Service type:', error);

    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || "Failed to create Service type.";
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
      throw new Error("An unexpected error occurred.");
    }
  }
};

export const getAllServiceTypes = async () => {
  try {
    const response = await AdminAxios.get('/service-types');

    if (response.status !== 200) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.data;
  } catch (error) {
    console.error('Failed to fetch Service types:', error);
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || "Failed to fetch Service types.";
      console.error(message);
      throw new Error(message);
    } else {
      throw new Error("An unexpected error occurred.");
    }
  }
};

export const updateServiceType = async (id: string, data: { name: string }) => {
  const loadingToast = toast.loading('Updating Service type...', {
    position: 'top-right'
  });

  try {
    const response = await AdminAxios.put(`/service-types/${id}`, data);

    if (response.status !== 200) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    toast.dismiss(loadingToast);
    toast.success('Service type updated successfully! ✏️', {
      position: 'top-right',
      duration: 4000,
      style: {
        background: '#DBEAFE',
        color: '#1D4ED8',
        border: '1px solid #93C5FD'
      }
    });

    return response.data;
  } catch (error) {
    toast.dismiss(loadingToast);
    console.error('Failed to update Service type:', error);

    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || "Failed to update Service type.";
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
      throw new Error("An unexpected error occurred.");
    }
  }
};

export const updateServiceTypeStatus = async (id: string, isActive: boolean) => {
  const action = isActive ? 'Activating' : 'Blocking';
  const loadingToast = toast.loading(`${action} Service type...`, {
    position: 'top-right'
  });

  try {
    const response = await AdminAxios.patch(`/service-types/${id}/status`, {
      isActive
    });

    if (response.status !== 200) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    toast.dismiss(loadingToast);
    toast.success(`Service type ${isActive ? 'activated' : 'blocked'} successfully! ${isActive ? '✅' : '❌'}`, {
      position: 'top-right',
      duration: 4000,
      style: {
        background: isActive ? '#D1FAE5' : '#FEF3C7',
        color: isActive ? '#059669' : '#D97706',
        border: `1px solid ${isActive ? '#34D399' : '#FBBF24'}`
      }
    });

    return response.data;
  } catch (error) {
    toast.dismiss(loadingToast);
    console.error('Failed to update Service type status:', error);

    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || "Failed to update Service type status.";
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
      throw new Error("An unexpected error occurred.");
    }
  }
};