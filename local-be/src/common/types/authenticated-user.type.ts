import { Role } from '../constants/auth.constants';

export interface AuthenticatedUser {
  userId: string;
  role: Role;
  vendorId?: string;
}

export interface JwtAccessPayload {
  sub: string;
  role: Role;
  iat?: number;
  exp?: number;
}
