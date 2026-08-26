import { apiClient } from "./apiClient";

// Mirrors local-be's users/domain/user.ts (only the fields the dashboard needs).
export interface AuthUser {
  id: string;
  phone: string;
  email?: string;
  firstName: string;
  lastName: string;
  role: "admin" | "vendor";
  vendorId?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  refreshExpiresIn: number;
}

export interface LoginResponse {
  success: true;
  user: AuthUser;
  tokens: AuthTokens;
  vendor?: { id: string; storeName: string; status: string; message?: string };
}

// identifier accepts either the account's phone or email (see
// local-be/src/auth/dto/login.dto.ts) — the dashboard login form collects email.
export async function login(identifier: string, password: string): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>("/dashboard/auth/login", {
    identifier,
    password,
  });

  return data;
}

export async function logout(refreshToken: string | null): Promise<void> {
  await apiClient.post("/dashboard/auth/logout", refreshToken ? { refreshToken } : {});
}

export interface SendOtpResponse {
  success: true;
  message: string;
  expiresIn: number;
}

// Always resolves with the same generic message regardless of whether the
// email exists — the backend deliberately doesn't reveal that. Only sends a
// code when a vendor/admin account with this email actually exists.
export async function forgotPassword(email: string): Promise<SendOtpResponse> {
  const { data } = await apiClient.post<SendOtpResponse>("/dashboard/auth/forgot-password", {
    email,
  });

  return data;
}

// Middle step — confirms the code without consuming it, so the UI can move
// to the password screen before resetPassword's own (consuming) check.
export async function verifyResetOtp(email: string, otp: string): Promise<void> {
  await apiClient.post("/dashboard/auth/verify-reset-otp", { email, otp });
}

export async function resetPassword(
  email: string,
  otp: string,
  newPassword: string
): Promise<void> {
  await apiClient.post("/dashboard/auth/reset-password", { email, otp, newPassword });
}
