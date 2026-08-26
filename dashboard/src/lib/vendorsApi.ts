import axios from "axios";

import { apiClient } from "./apiClient";

export interface RegisterVendorPayload {
  phone: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  storeName: string;
  storeDescription?: string;
  city?: string;
  country?: string;
  address?: string;
  kycDocumentUrl: string;
}

export interface SendOtpResponse {
  success: true;
  message: string;
  expiresIn: number;
}

export interface VendorRegisteredResponse {
  success: true;
  message: string;
  vendor: { id: string; userId: string; storeName: string; status: string; message: string };
}

// Step 1 — sends an OTP to payload.email, creates nothing yet.
export async function registerVendor(payload: RegisterVendorPayload): Promise<SendOtpResponse> {
  const { data } = await apiClient.post<SendOtpResponse>("/vendors/register", payload);

  return data;
}

// Re-sends the OTP for an in-progress registration.
export async function resendVendorOtp(email: string): Promise<SendOtpResponse> {
  const { data } = await apiClient.post<SendOtpResponse>("/vendors/resend-otp", { email });

  return data;
}

// Step 2 — verifies the OTP from registerVendor and creates the account.
export async function verifyVendorRegistration(
  payload: RegisterVendorPayload & { otp: string }
): Promise<VendorRegisteredResponse> {
  const { data } = await apiClient.post<VendorRegisteredResponse>(
    "/vendors/verify-registration",
    payload
  );

  return data;
}

// Public (no auth) — there's no account yet at this point in registration.
// See local-be's POST /vendors/kyc-upload-url.
export async function uploadKycDocument(file: File): Promise<string> {
  const { data } = await apiClient.post<{ success: true; uploadUrl: string; fileUrl: string }>(
    "/vendors/kyc-upload-url",
    { fileName: file.name, contentType: file.type }
  );

  // Straight to S3 — not through apiClient, which would attach our JSON
  // headers/Bearer token that S3's presigned URL neither expects nor allows.
  await axios.put(data.uploadUrl, file, { headers: { "Content-Type": file.type } });

  return data.fileUrl;
}

// Mirrors local-be's vendors/domain/vendor.ts (only the fields the vendor's
// own Store Profile page needs — businessLicense is excluded server-side).
export interface VendorProfile {
  id: string;
  userId: string;
  storeName: string;
  storeDescription?: string;
  city?: string;
  country?: string;
  address?: string;
  phone?: string;
  logoUrl?: string;
  kycDocumentUrl?: string;
  status: "pending_approval" | "active" | "suspended" | "inactive";
  approvedAt?: string;
  rating: number;
  totalReviews: number;
  createdAt: string;
  updatedAt: string;
}

export async function getMyVendor(): Promise<VendorProfile> {
  const { data } = await apiClient.get<{ success: true; vendor: VendorProfile }>("/vendors/me");

  return data.vendor;
}

export interface UpdateVendorProfilePayload {
  storeDescription?: string;
  city?: string;
  address?: string;
  phone?: string;
  logoUrl?: string;
}

export async function updateVendorProfile(
  payload: UpdateVendorProfilePayload
): Promise<VendorProfile> {
  const { data } = await apiClient.put<{ success: true; vendor: VendorProfile }>(
    "/vendors/update-profile",
    payload
  );

  return data.vendor;
}

// Authenticated upload (logo, post-registration) — distinct from
// uploadKycDocument's public pre-account flow.
export async function uploadVendorLogo(file: File): Promise<string> {
  const { data } = await apiClient.post<{ success: true; uploadUrl: string; fileUrl: string }>(
    "/files/upload-url",
    { fileName: file.name, contentType: file.type, purpose: "vendor-logo" }
  );

  await axios.put(data.uploadUrl, file, { headers: { "Content-Type": file.type } });

  return data.fileUrl;
}
