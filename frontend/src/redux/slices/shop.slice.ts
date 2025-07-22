// src/redux/slices/shop.slice.ts
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface GeoLocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

interface ShopData {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  logo?: string;
  city?: string;
  streetAddress?: string;
  description?: string;
  certificateUrl?: string;
  location?: GeoLocation;
  isActive?: boolean;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Define the shape of the Redux state
interface ShopState {
  isAuthenticated: boolean;
  isLoading: boolean;
  shopData: ShopData | null;
  token: string | null;
}

// Initialize state with localStorage if available
const getInitialState = (): ShopState => {
  try {
    const storedShopData = localStorage.getItem('shopData');
    const storedToken = localStorage.getItem('shopToken');
    
    return {
      shopData: storedShopData ? JSON.parse(storedShopData) : null,
      token: storedToken,
      isAuthenticated: !!(storedShopData && storedToken),
      isLoading: false,
    };
  } catch (error) {
    console.error("Failed to parse shop data from localStorage:", error);
    // Clear corrupted data
    localStorage.removeItem('shopData');
    localStorage.removeItem('shopToken');
    return {
      shopData: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    };
  }
};

const initialState: ShopState = getInitialState();

// Create the shop slice
const shopSlice = createSlice({
  name: 'shop',
  initialState,
  reducers: {
    loginShop: (state, action: PayloadAction<{ shop: ShopData; token: string }>) => {
      state.shopData = action.payload.shop;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.isLoading = false;
      
      // Sync with localStorage
      localStorage.setItem('shopData', JSON.stringify(action.payload.shop));
      localStorage.setItem('shopToken', action.payload.token);
    },
    
    logoutShop: (state) => {
      state.shopData = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      
      // Clear localStorage
      localStorage.removeItem('shopData');
      localStorage.removeItem('shopToken');
    },
    
    updateShop: (state, action: PayloadAction<Partial<ShopData>>) => {
      if (state.shopData) {
        state.shopData = { ...state.shopData, ...action.payload };
        localStorage.setItem('shopData', JSON.stringify(state.shopData));
      }
    },
    
    setShopLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
    // Deprecated: keeping for backward compatibility
    addShop: (state, action: PayloadAction<ShopData>) => {
      state.shopData = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem('shopData', JSON.stringify(action.payload));
    },
    
    removeShop: (state) => {
      state.shopData = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('shopData');
      localStorage.removeItem('shopToken');
    },
  },
});

export const { 
  loginShop, 
  logoutShop, 
  updateShop, 
  setShopLoading,
  addShop, 
  removeShop 
} = shopSlice.actions;

export default shopSlice.reducer;