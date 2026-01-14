import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import assetsReducer from './assetsSlice';
import appReducer from './appSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    assets: assetsReducer,
    app: appReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
