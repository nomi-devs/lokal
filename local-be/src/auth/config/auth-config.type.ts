import type { StringValue } from 'ms';

export type AuthConfig = {
  jwtSecret: string;
  jwtRefreshSecret: string;
  jwtAccessExpiresIn: StringValue;
  jwtRefreshExpiresIn: StringValue;
  jwtAccessExpirySeconds: number;
  jwtRefreshExpirySeconds: number;
  otpLength: number;
  otpExpiryMinutes: number;
  otpMaxAttempts: number;
  otpMaxRequestsPerHour: number;
  bcryptRounds: number;
  maxActiveSessions: number;
};
