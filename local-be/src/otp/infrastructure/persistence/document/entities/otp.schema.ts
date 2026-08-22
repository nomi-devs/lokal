import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { EntityDocumentHelper } from '../../../../../utils/document-entity-helper';

export type OtpSchemaDocument = HydratedDocument<OtpSchemaClass>;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class OtpSchemaClass extends EntityDocumentHelper {
  @Prop({ required: true, index: true })
  phone: string;

  @Prop({ required: true, select: false })
  otpHash: string;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ default: 0 })
  attempts: number;

  @Prop({ default: false })
  isUsed: boolean;

  createdAt?: Date;
}

export const OtpSchema = SchemaFactory.createForClass(OtpSchemaClass);
OtpSchema.index({ phone: 1, createdAt: -1 });
