import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { EntityDocumentHelper } from '../../../../../utils/document-entity-helper';
import {
  ROLES,
  USER_STATUSES,
} from '../../../../../common/constants/auth.constants';
import type {
  Role,
  UserStatus,
} from '../../../../../common/constants/auth.constants';

export type UserSchemaDocument = HydratedDocument<UserSchemaClass>;

@Schema({ _id: false })
class FcmTokenSchema {
  @Prop({ required: true })
  token: string;

  @Prop({ enum: ['ios', 'android'], required: true })
  device: 'ios' | 'android';

  @Prop({ default: Date.now })
  addedAt: Date;

  @Prop({ default: Date.now })
  lastUsedAt: Date;
}

@Schema({ timestamps: true })
export class UserSchemaClass extends EntityDocumentHelper {
  @Prop({ required: true, unique: true, index: true })
  phone: string;

  @Prop({ unique: true, sparse: true })
  email?: string;

  @Prop({ default: '' })
  firstName: string;

  @Prop({ default: '' })
  lastName: string;

  @Prop()
  photoUrl?: string;

  // Only set for vendor/admin — customers authenticate via OTP only.
  @Prop({ select: false })
  passwordHash?: string;

  @Prop({ enum: ROLES, default: 'customer', index: true })
  role: Role;

  @Prop({ enum: USER_STATUSES, default: 'active', index: true })
  status: UserStatus;

  @Prop({ type: Types.ObjectId, ref: 'VendorSchemaClass' })
  vendorId?: Types.ObjectId;

  @Prop({ enum: ['en', 'ar'], default: 'en' })
  language: 'en' | 'ar';

  @Prop({ default: 'Asia/Kuwait' })
  timezone: string;

  @Prop({ type: [FcmTokenSchema], default: [] })
  fcmTokens: FcmTokenSchema[];

  @Prop({ default: true })
  notificationsEnabled: boolean;

  @Prop()
  lastLogin?: Date;

  @Prop()
  lastLoginIp?: string;

  @Prop({ default: 0 })
  loginAttempts: number;

  @Prop({ default: false })
  isPhoneVerified: boolean;

  @Prop({ default: 0 })
  rating: number;

  @Prop({ default: 0 })
  reviewCount: number;

  @Prop()
  deletedAt?: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(UserSchemaClass);
