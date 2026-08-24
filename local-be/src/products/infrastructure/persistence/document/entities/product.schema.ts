import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { EntityDocumentHelper } from '../../../../../utils/document-entity-helper';

export type ProductSchemaDocument = HydratedDocument<ProductSchemaClass>;

class LocalizedTextSchema {
  @Prop({ required: true }) en: string;
  @Prop() ar?: string;
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

  // String UUID, not ObjectId — matches CategorySchemaClass's _id (see
  // categories/infrastructure/persistence/document/entities/category.schema.ts).
  @Prop({
    type: String,
    ref: 'CategorySchemaClass',
    required: true,
    index: true,
  })
  categoryId: string;

  @Prop({ enum: ['male', 'female', 'kids', 'unisex'], required: true })
  gender: string;

  @Prop({ type: LocalizedTextSchema, required: true })
  name: LocalizedTextSchema;

  @Prop({ type: LocalizedTextSchema, required: true })
  description: LocalizedTextSchema;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ required: true })
  price: number;

  @Prop()
  compareAtPrice?: number;

  @Prop({ type: [String], default: [] })
  sizes: string[];

  @Prop({ type: [String], default: [] })
  colors: string[];

  @Prop({ default: 0 })
  stock: number;

  @Prop({ default: true })
  inStock: boolean;

  @Prop({
    enum: ['active', 'inactive', 'rejected'],
    default: 'active',
    index: true,
  })
  status: string;

  @Prop()
  rejectionReason?: string;

  @Prop({ default: 0 })
  rating: number;

  @Prop({ default: 0 })
  ratingCount: number;

  @Prop({ default: 0 })
  salesCount: number;

  @Prop({ default: 0 })
  viewCount: number;

  @Prop()
  deletedAt?: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

export const ProductSchema = SchemaFactory.createForClass(ProductSchemaClass);
