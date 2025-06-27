import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { ShopForm } from '@/types/auth.type';
import { registerShop, loginShop } from '@/services/shop/authService';

// Define the shop state interface
export interface ShopState {
  shop: any | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

// Initial state
const initialState: ShopState = {
  shop: null,
  token: localStorage.getItem('shopToken'),
  isLoading: false,
  error: null,
  isAuthenticated: !!localStorage.getItem('shopToken'),
};

// Async thunks for shop actions
export const signupShop = createAsyncThunk(
  'shop/signup',
  async (shopData: ShopForm, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      
      // Append all form fields
      formData.append('mode', shopData.mode);
      formData.append('name', shopData.name);
      formData.append('email', shopData.email);
      formData.append('phone', shopData.phone);
      formData.append('password', shopData.password);
      formData.append('city', shopData.city);
      formData.append('streetAddress', shopData.streetAddress);
      formData.append('buildingNumber', shopData.buildingNumber);
      formData.append('description', shopData.description);
      
      // Handle logo
      if (shopData.logo instanceof File) {
        formData.append('logo', shopData.logo);
      }
      
      // Handle certificate
      if (shopData.certificateUrl instanceof File) {
        formData.append('certificate', shopData.certificateUrl);
      }
      
      // Handle location
      if (shopData.location) {
        formData.append('location', JSON.stringify(shopData.location));
      }

      const response = await registerShop(formData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Shop registration failed');
    }
  }
);

export const loginShopAsync = createAsyncThunk(
  'shop/login',
  async (loginData: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await loginShop(loginData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Shop login failed');
    }
  }
);

// Shop slice
const shopSlice = createSlice({
  name: 'shop',
  initialState,
  reducers: {
    logout: (state) => {
      state.shop = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('shopToken');
      localStorage.removeItem('shop');
    },
    clearError: (state) => {
      state.error = null;
    },
    setShop: (state, action: PayloadAction<any>) => {
      state.shop = action.payload;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // Signup cases
      .addCase(signupShop.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signupShop.fulfilled, (state, action) => {
        state.isLoading = false;
        state.shop = action.payload.shop;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        localStorage.setItem('shopToken', action.payload.token);
        localStorage.setItem('shop', JSON.stringify(action.payload.shop));
      })
      .addCase(signupShop.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Login cases
      .addCase(loginShopAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginShopAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.shop = action.payload.shop;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        localStorage.setItem('shopToken', action.payload.token);
        localStorage.setItem('shop', JSON.stringify(action.payload.shop));
      })
      .addCase(loginShopAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError, setShop } = shopSlice.actions;
export default shopSlice.reducer;