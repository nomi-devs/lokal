import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { EntityDocumentHelper } from '../../../../../utils/document-entity-helper';

export type ProductSchemaDocument = HydratedDocument<ProductSchemaClass>;

class ProductPriceSchema {
  @Prop({ required: true }) base: number;
  @Prop({ required: true }) currency: string;
  @Prop() compareAt?: number;
}

class ProductRatingsSchema {
  @Prop({ default: 0 }) average: number;
  @Prop({ default: 0 }) count: number;
}

@Schema({ timestamps: true })
export class ProductSchemaClass extends EntityDocumentHelper {
  @Prop({
    type: Types.ObjectId,
    ref: 'VendorSchemaClass',
    required: true,
    index: true,
  })
  vendorId: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  categoryId?: Types.ObjectId;

  @Prop({ enum: ['men', 'women', 'kids', 'unisex'], required: true })
  department: string;

  @Prop({ required: true })
  nameEn: string;

  @Prop({ required: true })
  nameAr: string;

  @Prop()
  descriptionEn?: string;

  @Prop()
  descriptionAr?: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ type: ProductPriceSchema, required: true })
  price: ProductPriceSchema;

  @Prop({ type: [String], default: [] })
  sizes: string[];

  @Prop({ type: [String], default: [] })
  colors: string[];

  @Prop({ default: 0 })
  stock: number;

  @Prop({
    enum: ['active', 'inactive', 'out_of_stock'],
    default: 'active',
    index: true,
  })
  status: string;

  @Prop({ type: ProductRatingsSchema, default: { average: 0, count: 0 } })
  ratings: ProductRatingsSchema;

  @Prop()
  deletedAt?: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

export const ProductSchema = SchemaFactory.createForClass(ProductSchemaClass);
