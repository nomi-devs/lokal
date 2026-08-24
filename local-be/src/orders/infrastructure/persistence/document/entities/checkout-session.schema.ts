import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { EntityDocumentHelper } from '../../../../../utils/document-entity-helper';

export type CheckoutSessionSchemaDocument =
  HydratedDocument<CheckoutSessionSchemaClass>;

class CheckoutItemNameSchema {
  @Prop({ required: true }) en: string;
  @Prop() ar?: string;
}

@Schema({ _id: false })
class CheckoutOrderItemSchema {
  @Prop({ type: Types.ObjectId, ref: 'ProductSchemaClass', required: true })
  productId: Types.ObjectId;

  @Prop({ type: CheckoutItemNameSchema, required: true })
  name: CheckoutItemNameSchema;

  @Prop()
  size?: string;

  @Prop()
  color?: string;

  @Prop({ required: true, min: 1 })
  qty: number;

  @Prop({ required: true })
  unitPrice: number;
}

@Schema({ _id: false })
class CheckoutOrderDraftSchema {
  @Prop({ type: Types.ObjectId, ref: 'VendorSchemaClass', required: true })
  storeId: Types.ObjectId;

  @Prop({ type: [CheckoutOrderItemSchema], required: true })
  items: CheckoutOrderItemSchema[];

  @Prop({ required: true })
  subtotal: number;

  @Prop({ required: true })
  deliveryFee: number;

  @Prop({ required: true })
  total: number;

  @Prop({ required: true })
  commissionPercentSnapshot: number;
}

@Schema({ _id: false })
class CheckoutAddressSnapshotSchema {
  @Prop({ enum: ['home', 'office', 'other'], required: true })
  label: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  country?: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  addressLine: string;
}

@Schema({ timestamps: true })
export class CheckoutSessionSchemaClass extends EntityDocumentHelper {
  @Prop({
    type: Types.ObjectId,
    ref: 'UserSchemaClass',
    required: true,
    index: true,
  })
  userId: Types.ObjectId;

  @Prop({ type: CheckoutAddressSnapshotSchema, required: true })
  addressSnapshot: CheckoutAddressSnapshotSchema;

  @Prop({ required: true })
  paymentMethodType: string;

  @Prop({ type: [CheckoutOrderDraftSchema], required: true })
  orders: CheckoutOrderDraftSchema[];

  @Prop({ required: true })
  totalAmount: number;

  @Prop({ type: [Types.ObjectId], default: [] })
  cartItemIds: Types.ObjectId[];

  @Prop({ index: true })
  myFatoorahInvoiceId?: string;

  @Prop({
    enum: ['pending', 'paid', 'failed'],
    default: 'pending',
    required: true,
    index: true,
  })
  status: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const CheckoutSessionSchema = SchemaFactory.createForClass(
  CheckoutSessionSchemaClass,
);
