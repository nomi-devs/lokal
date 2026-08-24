import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { EntityDocumentHelper } from '../../../../../utils/document-entity-helper';

export type OrderSchemaDocument = HydratedDocument<OrderSchemaClass>;

class OrderItemNameSchema {
  @Prop({ required: true }) en: string;
  @Prop() ar?: string;
}

@Schema({ _id: false })
class OrderItemSchema {
  @Prop({ type: Types.ObjectId, ref: 'ProductSchemaClass', required: true })
  productId: Types.ObjectId;

  @Prop({ type: OrderItemNameSchema, required: true })
  name: OrderItemNameSchema;

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
class OrderAddressSnapshotSchema {
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

@Schema({ _id: false })
class OrderDriverSchema {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  phone: string;

  @Prop()
  photoUrl?: string;

  @Prop()
  vehicleInfo?: string;
}

@Schema({ _id: false })
class OrderStatusHistoryEntrySchema {
  @Prop({
    enum: ['placed', 'confirmed', 'in_transit', 'delivered', 'cancelled'],
    required: true,
  })
  status: string;

  @Prop()
  note?: string;

  @Prop({ required: true })
  timestamp: Date;
}

@Schema({ timestamps: true })
export class OrderSchemaClass extends EntityDocumentHelper {
  @Prop({ required: true, unique: true, index: true })
  orderNumber: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'UserSchemaClass',
    required: true,
    index: true,
  })
  customerId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'VendorSchemaClass',
    required: true,
    index: true,
  })
  storeId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'CheckoutSessionSchemaClass',
    required: true,
    index: true,
  })
  checkoutSessionId: Types.ObjectId;

  @Prop({ type: [OrderItemSchema], required: true })
  items: OrderItemSchema[];

  @Prop({ required: true })
  subtotal: number;

  @Prop({ required: true })
  deliveryFee: number;

  @Prop({ required: true })
  total: number;

  @Prop({ required: true })
  commissionPercentSnapshot: number;

  @Prop({ type: OrderAddressSnapshotSchema, required: true })
  addressSnapshot: OrderAddressSnapshotSchema;

  @Prop({ required: true })
  paymentMethodType: string;

  @Prop({
    enum: ['pending', 'paid', 'failed'],
    default: 'paid',
    required: true,
  })
  paymentStatus: string;

  @Prop({
    enum: ['placed', 'confirmed', 'in_transit', 'delivered', 'cancelled'],
    default: 'placed',
    required: true,
    index: true,
  })
  status: string;

  @Prop({ type: [OrderStatusHistoryEntrySchema], default: [] })
  statusHistory: OrderStatusHistoryEntrySchema[];

  @Prop({ type: OrderDriverSchema })
  driver?: OrderDriverSchema;

  createdAt?: Date;
  updatedAt?: Date;
}

export const OrderSchema = SchemaFactory.createForClass(OrderSchemaClass);
