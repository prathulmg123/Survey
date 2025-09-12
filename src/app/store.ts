import { configureStore } from '@reduxjs/toolkit';
import loaderReducer from '@/features/loader/loaderSlice';

export const store = configureStore({
  reducer: {
    loader: loaderReducer,
    // Add other reducers here
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
