import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { EntityDocumentHelper } from '../../../../../utils/document-entity-helper';

export type CartSchemaDocument = HydratedDocument<CartSchemaClass>;

@Schema({ _id: true })
class CartItemSchemaClass extends EntityDocumentHelper {
  @Prop({ type: Types.ObjectId, ref: 'ProductSchemaClass', required: true })
  productId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'VendorSchemaClass', required: true })
  storeId: Types.ObjectId;

  @Prop()
  size?: string;

  @Prop()
  color?: string;

  @Prop({ required: true, min: 1 })
  qty: number;

  @Prop({ required: true })
  unitPrice: number;
}

const CartItemSchema = SchemaFactory.createForClass(CartItemSchemaClass);

@Schema({ timestamps: true })
export class CartSchemaClass extends EntityDocumentHelper {
  @Prop({
    type: Types.ObjectId,
    ref: 'UserSchemaClass',
    required: true,
    unique: true,
    index: true,
  })
  userId: Types.ObjectId;

  @Prop({ type: [CartItemSchema], default: [] })
  items: CartItemSchemaClass[];

  createdAt?: Date;
  updatedAt?: Date;
}

export const CartSchema = SchemaFactory.createForClass(CartSchemaClass);
