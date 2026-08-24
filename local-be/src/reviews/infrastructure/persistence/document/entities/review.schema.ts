import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { EntityDocumentHelper } from '../../../../../utils/document-entity-helper';
import { REVIEW_STATUSES } from '../../../../reviews.constants';

export type ReviewSchemaDocument = HydratedDocument<ReviewSchemaClass>;

class LocalizedTextSchema {
  @Prop({ required: true }) en: string;
  @Prop() ar?: string;
}

@Schema({ timestamps: true })
export class ReviewSchemaClass extends EntityDocumentHelper {
  @Prop({
    type: Types.ObjectId,
    ref: 'ProductSchemaClass',
    required: true,
    index: true,
  })
  productId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'VendorSchemaClass',
    required: true,
    index: true,
  })
  vendorId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'OrderSchemaClass',
    required: true,
  })
  orderId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'UserSchemaClass',
    required: true,
    index: true,
  })
  customerId: Types.ObjectId;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ type: LocalizedTextSchema, required: true })
  title: LocalizedTextSchema;

  @Prop({ type: LocalizedTextSchema, required: true })
  comment: LocalizedTextSchema;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ default: true })
  isVerifiedPurchase: boolean;

  @Prop({
    enum: REVIEW_STATUSES,
    default: 'pending',
    required: true,
    index: true,
  })
  status: string;

  @Prop()
  rejectionReason?: string;

  @Prop()
  approvedAt?: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

export const ReviewSchema = SchemaFactory.createForClass(ReviewSchemaClass);

// One review per customer per order per product — see
// ReviewRepository.findOneByCustomerOrderProduct.
ReviewSchema.index(
  { customerId: 1, orderId: 1, productId: 1 },
  { unique: true },
);
ReviewSchema.index({ productId: 1, status: 1 });
ReviewSchema.index({ vendorId: 1, status: 1 });
