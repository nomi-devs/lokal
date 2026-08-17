// src/store/slices/authSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import { mockUsers } from "../../constants";

interface AuthState {
  isAuthenticated: boolean;
  user: { id: string; email: string; role: "admin" | "user" } | null;
  error: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login(state, action: PayloadAction<{ email: string; password: string }>) {
      const foundUser = mockUsers.find(
        (u) => u.email === action.payload.email && u.password === action.payload.password
      );

      if (foundUser) {
        state.isAuthenticated = true;
        state.user = {
          id: foundUser.id,
          email: foundUser.email,
          role: foundUser.role as "admin" | "user",
        };
        state.error = null;
      } else {
        state.error = "Invalid email or password";
      }
    },
    clearError(state) {
      state.error = null;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
      state.error = null;
    },
    register(
      _state: AuthState,
      _action: PayloadAction<{ email: string; name: string; password: string }>
    ) {
      // Registration logic can be added here
      // For now, we will just log the registration attempt
      console.log("Register action dispatched", _action);
      // You can also handle user creation and state updates here if needed
    },
  },
});

export const { login, logout, register, clearError } = authSlice.actions;
export default authSlice.reducer;
