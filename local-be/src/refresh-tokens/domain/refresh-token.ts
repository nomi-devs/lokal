export class RefreshTokenDeviceInfo {
  userAgent?: string;
  ip?: string;
  device?: 'ios' | 'android';
}

export class RefreshToken {
  id: string;
  userId: string;
  tokenHash: string;
  deviceInfo: RefreshTokenDeviceInfo;
  expiresAt: Date;
  isRevoked: boolean;
  createdAt: Date;
}
