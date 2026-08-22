import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { EntityDocumentHelper } from '../../../../../utils/document-entity-helper';

export type RefreshTokenSchemaDocument =
  HydratedDocument<RefreshTokenSchemaClass>;

@Schema({ _id: false })
class DeviceInfoSchema {
  @Prop()
  userAgent?: string;

  @Prop()
  ip?: string;

  @Prop({ enum: ['ios', 'android'] })
  device?: 'ios' | 'android';
}

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class RefreshTokenSchemaClass extends EntityDocumentHelper {
  @Prop({
    type: Types.ObjectId,
    ref: 'UserSchemaClass',
    required: true,
    index: true,
  })
  userId: Types.ObjectId;

  // sha256 hex digest of the raw refresh token, so a session can be looked up
  // directly on refresh without linearly bcrypt-comparing every active session.
  @Prop({ required: true, unique: true, index: true })
  tokenHash: string;

  @Prop({ type: DeviceInfoSchema, default: {} })
  deviceInfo: DeviceInfoSchema;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ default: false })
  isRevoked: boolean;

  createdAt?: Date;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(
  RefreshTokenSchemaClass,
);
