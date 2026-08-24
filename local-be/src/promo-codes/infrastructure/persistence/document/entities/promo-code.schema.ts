import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { v4 as uuid } from 'uuid';
import { EntityDocumentHelper } from '../../../../../utils/document-entity-helper';

export type PromoCodeSchemaDocument = HydratedDocument<PromoCodeSchemaClass>;

@Schema({ timestamps: true })
export class PromoCodeSchemaClass extends EntityDocumentHelper {
  @Prop({ type: String, default: () => uuid() })
  declare _id: string;

  @Prop({
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    index: true,
  })
  code: string;

  @Prop({ enum: ['percentage', 'fixed'], required: true })
  discountType: string;

  @Prop({ required: true })
  discountValue: number;

  @Prop()
  maxUsageCount?: number;

  @Prop({ default: 0 })
  currentUsageCount: number;

  @Prop({ type: [Types.ObjectId], default: [] })
  applicableVendorIds: Types.ObjectId[];

  @Prop({ type: [String], default: [] })
  applicableCategoryIds: string[];

  @Prop()
  minOrderValue?: number;

  @Prop()
  maxDiscountCap?: number;

  @Prop({ required: true })
  validFrom: Date;

  @Prop({ required: true })
  validUntil: Date;

  @Prop({ default: true, index: true })
  isActive: boolean;

  @Prop()
  lastUsedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'UserSchemaClass', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'UserSchemaClass' })
  updatedBy?: Types.ObjectId;

  createdAt?: Date;
  updatedAt?: Date;
}

export const PromoCodeSchema =
  SchemaFactory.createForClass(PromoCodeSchemaClass);
