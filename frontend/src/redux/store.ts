import { configureStore } from '@reduxjs/toolkit';
import userSlice from './slices/user.slice';
import shopSlice from './slices/shop.slice';
import adminSlice from './slices/admin.slice';
export const store = configureStore({
  reducer: {
    user: userSlice,
    shop:shopSlice,
    admin: adminSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;