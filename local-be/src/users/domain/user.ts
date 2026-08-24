import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import type { Role, UserStatus } from '../../common/constants/auth.constants';

class FcmTokenEntry {
  @ApiProperty()
  token: string;

  @ApiProperty({ enum: ['ios', 'android'] })
  device: 'ios' | 'android';

  @ApiProperty()
  addedAt: Date;

  @ApiProperty()
  lastUsedAt: Date;
}

export class User {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String, example: '+96500000000' })
  phone: string;

  @ApiProperty({ type: String, nullable: true, example: 'john@example.com' })
  email?: string;

  @ApiProperty({ type: String })
  firstName: string;

  @ApiProperty({ type: String })
  lastName: string;

  @ApiProperty({ type: String, nullable: true })
  photoUrl?: string;

  // Never serialized in responses — set only for vendor/admin accounts.
  @Exclude({ toPlainOnly: true })
  passwordHash?: string;

  @ApiProperty({ enum: ['customer', 'vendor', 'admin'] })
  role: Role;

  @ApiProperty({ enum: ['active', 'inactive', 'suspended', 'deleted'] })
  status: UserStatus;

  @ApiProperty({ type: String, nullable: true })
  vendorId?: string;

  @ApiProperty({ enum: ['en', 'ar'] })
  language: 'en' | 'ar';

  @ApiProperty({ type: String })
  timezone: string;

  @ApiProperty({ type: [FcmTokenEntry] })
  fcmTokens: FcmTokenEntry[];

  @ApiProperty()
  notificationsEnabled: boolean;

  @ApiProperty({ type: Date, nullable: true })
  lastLogin?: Date;

  // Only surfaced when serialized with { groups: ['admin'] } (see admin
  // controllers' @SerializeOptions) — hidden from a user's own /auth/me etc.
  @ApiProperty({ type: String, required: false })
  @Expose({ groups: ['admin'] })
  lastLoginIp?: string;

  @ApiProperty({ required: false })
  @Expose({ groups: ['admin'] })
  loginAttempts: number;

  @ApiProperty()
  isPhoneVerified: boolean;

  @ApiProperty()
  rating: number;

  @ApiProperty()
  reviewCount: number;

  @Exclude({ toPlainOnly: true })
  deletedAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
