// Default values for auth tuning knobs. Every value here is also overridable
// via the matching env var (see .env) without a code change or redeploy.
export const OTP_LENGTH_DEFAULT = 6;
export const OTP_EXPIRY_MINUTES_DEFAULT = 5;
export const OTP_MAX_ATTEMPTS_DEFAULT = 3;
export const OTP_MAX_REQUESTS_PER_HOUR_DEFAULT = 5;

export const BCRYPT_ROUNDS_DEFAULT = 10;
export const MAX_ACTIVE_SESSIONS_DEFAULT = 5;

export const JWT_ACCESS_EXPIRES_IN_DEFAULT = '24h';
export const JWT_REFRESH_EXPIRES_IN_DEFAULT = '30d';
export const JWT_REFRESH_EXPIRY_SECONDS_DEFAULT = 30 * 24 * 60 * 60;
export const JWT_ACCESS_EXPIRY_SECONDS_DEFAULT = 24 * 60 * 60;

export const ROLES = ['customer', 'vendor', 'admin'] as const;
export type Role = (typeof ROLES)[number];

export const USER_STATUSES = [
  'active',
  'inactive',
  'suspended',
  'deleted',
] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const VENDOR_STATUSES = [
  'pending_approval',
  'active',
  'suspended',
  'inactive',
] as const;
export type VendorStatus = (typeof VENDOR_STATUSES)[number];
