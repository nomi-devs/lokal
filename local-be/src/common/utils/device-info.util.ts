import { Request } from 'express';

export interface DeviceInfo {
  userAgent?: string;
  ip?: string;
  device?: 'ios' | 'android';
}

export function resolveDeviceInfo(
  request: Request,
  provided?: DeviceInfo,
): DeviceInfo {
  return {
    userAgent: provided?.userAgent ?? request.headers['user-agent'],
    ip: provided?.ip ?? request.ip,
    device: provided?.device,
  };
}
