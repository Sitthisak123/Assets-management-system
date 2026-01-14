import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type User = {
  id: number;
  username: string;
  email?: string;
  role?: number;
  title?: string;
  personel_id?: number;
  status?: number;
};

interface UserState {
  user: User | null;
  token: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: UserState = {
  user: null,
  token: null,
  status: 'idle',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },
    clearUser(state) {
      state.user = null;
      state.token = null;
      state.status = 'idle';
    },
    setToken(state, action: PayloadAction<string | null>) {
      state.token = action.payload;
    },
    setStatus(state, action: PayloadAction<UserState['status']>) {
      state.status = action.payload;
    },
  },
});

export const { setUser, clearUser, setToken, setStatus } = userSlice.actions;
export default userSlice.reducer;
