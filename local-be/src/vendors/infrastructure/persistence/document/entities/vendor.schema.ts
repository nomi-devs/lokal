import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { EntityDocumentHelper } from '../../../../../utils/document-entity-helper';
import { VENDOR_STATUSES } from '../../../../../common/constants/auth.constants';
import type { VendorStatus } from '../../../../../common/constants/auth.constants';

export type VendorSchemaDocument = HydratedDocument<VendorSchemaClass>;

@Schema({ timestamps: true })
export class VendorSchemaClass extends EntityDocumentHelper {
  @Prop({
    type: Types.ObjectId,
    ref: 'UserSchemaClass',
    required: true,
    unique: true,
    index: true,
  })
  userId: Types.ObjectId;

  @Prop({ required: true, unique: true })
  storeName: string;

  @Prop()
  storeDescription?: string;

  @Prop()
  city?: string;

  @Prop()
  country?: string;

  @Prop()
  address?: string;

  @Prop()
  phone?: string;

  @Prop()
  businessLicense?: string;

  @Prop()
  logoUrl?: string;

  @Prop({ enum: VENDOR_STATUSES, default: 'pending_approval', index: true })
  status: VendorStatus;

  @Prop()
  approvedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'UserSchemaClass' })
  approvedBy?: Types.ObjectId;

  @Prop()
  approvalNotes?: string;

  @Prop()
  rejectionReason?: string;

  @Prop()
  rejectionCategory?: string;

  @Prop()
  suspendReason?: string;

  @Prop()
  suspendedUntil?: Date;

  @Prop({
    type: { defaultPercentage: { type: Number, default: 15 } },
    default: { defaultPercentage: 15 },
  })
  commissionStructure: { defaultPercentage: number };

  @Prop({ default: 0 })
  rating: number;

  @Prop({ default: 0 })
  totalReviews: number;

  @Prop()
  deletedAt?: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

export const VendorSchema = SchemaFactory.createForClass(VendorSchemaClass);
