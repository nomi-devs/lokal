// src/store/slices/authSlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import * as authApi from "@/lib/authApi";
import type { AuthTokens, AuthUser } from "@/lib/authApi";
import { getApiErrorMessage } from "@/lib/apiClient";

interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: false,
  error: null,
};

export const loginAsync = createAsyncThunk(
  "auth/login",
  async (payload: { identifier: string; password: string }, { rejectWithValue }) => {
    try {
      return await authApi.login(payload.identifier, payload.password);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Invalid email/phone or password"));
    }
  }
);

// Dispatched fire-and-forget from sidebar/menu logout buttons — local state
// is cleared immediately on `pending` (see extraReducers) so the redirect to
// /login feels instant regardless of the network round trip underneath.
export const logoutAsync = createAsyncThunk("auth/logout", async (_: void, { getState }) => {
  const { refreshToken } = (getState() as { auth: AuthState }).auth;
  try {
    await authApi.logout(refreshToken);
  } catch {
    // Best-effort: local session is already cleared regardless of API outcome.
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    // Called by apiClient's response interceptor after a silent token refresh.
    tokenRefreshed(state, action: PayloadAction<{ accessToken: string; expiresIn: number }>) {
      state.accessToken = action.payload.accessToken;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.tokens.accessToken;
        state.refreshToken = action.payload.tokens.refreshToken;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string | undefined) ?? "Login failed";
      })
      .addCase(logoutAsync.pending, (state) => {
        // Drop isAuthenticated immediately so the redirect to /login feels
        // instant, but keep the refreshToken around until the request
        // actually goes out (see logoutAsync's getState() read below) —
        // resetting to initialState here would null it out first.
        state.isAuthenticated = false;
      })
      .addCase(logoutAsync.fulfilled, () => initialState)
      .addCase(logoutAsync.rejected, () => initialState);
  },
});

export const { clearError, tokenRefreshed } = authSlice.actions;
export default authSlice.reducer;

export type { AuthTokens, AuthUser };
