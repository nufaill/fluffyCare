// user.slice.ts - Updated with better authentication handling
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface UserData {
  id: string;
  fullName: string;
  email: string;
  profileImage: string;
}

interface UserState {
  isAuthenticated: boolean;
  isLoading: boolean;
  userDatas: UserData | null;
  token: string | null;
}

const getInitialState = (): UserState => {
  try {
    const storedUserData = localStorage.getItem('userDatas');
    const storedToken = localStorage.getItem('userToken');
    
    return {
      userDatas: storedUserData ? JSON.parse(storedUserData) : null,
      token: storedToken,
      isAuthenticated: !!(storedUserData && storedToken),
      isLoading: false,
    };
  } catch (error) {
    console.error('Failed to parse user data from localStorage:', error);
    // Clear corrupted data
    localStorage.removeItem('userDatas');
    localStorage.removeItem('userToken');
    return {
      userDatas: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    };
  }
};

const initialState: UserState = getInitialState();

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    loginUser: (state, action: PayloadAction<{ user: UserData; token: string }>) => {
      state.userDatas = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.isLoading = false;
      
      // Sync with localStorage
      localStorage.setItem('userDatas', JSON.stringify(action.payload.user));
      localStorage.setItem('userToken', action.payload.token);
    },
    
    logoutUser: (state) => {
      state.userDatas = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      
      // Clear localStorage
      localStorage.removeItem('userDatas');
      localStorage.removeItem('userToken');
    },
    
    updateUser: (state, action: PayloadAction<Partial<UserData>>) => {
      if (state.userDatas) {
        state.userDatas = { ...state.userDatas, ...action.payload };
        localStorage.setItem('userDatas', JSON.stringify(state.userDatas));
      }
    },
    
    setUserLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
    // Deprecated: keeping for backward compatibility
    addUser: (state, action: PayloadAction<UserData>) => {
      state.userDatas = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem('userDatas', JSON.stringify(action.payload));
    },
    
    removeUser: (state) => {
      state.userDatas = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('userDatas');
      localStorage.removeItem('userToken');
    },
  },
});

export const { 
  loginUser, 
  logoutUser, 
  updateUser, 
  setUserLoading,
  addUser, // deprecated
  removeUser // deprecated
} = userSlice.actions;

export default userSlice.reducer;