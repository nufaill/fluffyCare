// import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
// import { loginAdmin } from '@/services/authService';

// // Define the admin state interface
// export interface AdminState {
//   admin: any | null;
//   token: string | null;
//   isLoading: boolean;
//   error: string | null;
//   isAuthenticated: boolean;
// }

// // Initial state
// const initialState: AdminState = {
//   admin: null,
//   token: localStorage.getItem('adminToken'),
//   isLoading: false,
//   error: null,
//   isAuthenticated: !!localStorage.getItem('adminToken'),
// };

// // Async thunks for admin actions
// export const loginAdminAsync = createAsyncThunk(
//   'admin/login',
//   async (loginData: { email: string; password: string }, { rejectWithValue }) => {
//     try {
//       const response = await loginAdmin(loginData);
//       return response;
//     } catch (error: any) {
//       return rejectWithValue(error.response?.data?.message || 'Admin login failed');
//     }
//   }
// );

// // Admin slice
// const adminSlice = createSlice({
//   name: 'admin',
//   initialState,
//   reducers: {
//     logout: (state) => {
//       state.admin = null;
//       state.token = null;
//       state.isAuthenticated = false;
//       state.error = null;
//       localStorage.removeItem('adminToken');
//       localStorage.removeItem('admin');
//     },
//     clearError: (state) => {
//       state.error = null;
//     },
//     setAdmin: (state, action: PayloadAction<any>) => {
//       state.admin = action.payload;
//       state.isAuthenticated = true;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       // Login cases
//       .addCase(loginAdminAsync.pending, (state) => {
//         state.isLoading = true;
//         state.error = null;
//       })
//       .addCase(loginAdminAsync.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.admin = action.payload.admin;
//         state.token = action.payload.token;
//         state.isAuthenticated = true;
//         localStorage.setItem('adminToken', action.payload.token);
//         localStorage.setItem('admin', JSON.stringify(action.payload.admin));
//       })
//       .addCase(loginAdminAsync.rejected, (state, action) => {
//         state.isLoading = false;
//         state.error = action.payload as string;
//       });
//   },
// });

// export const { logout, clearError, setAdmin } = adminSlice.actions;
// export default adminSlice.reducer;