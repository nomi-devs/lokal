import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { v4 as uuid } from 'uuid';
import { EntityDocumentHelper } from '../../../../../utils/document-entity-helper';
import type { Department } from '../../../../domain/category';

export type CategorySchemaDocument = HydratedDocument<CategorySchemaClass>;

@Schema({ timestamps: true })
export class CategorySchemaClass extends EntityDocumentHelper {
  @Prop({ type: String, default: () => uuid() })
  declare _id: string;

  @Prop({ required: true })
  nameEn: string;

  @Prop({ required: true })
  nameAr: string;

  @Prop()
  descriptionEn?: string;

  @Prop()
  descriptionAr?: string;

  @Prop()
  imageUrl?: string;

  @Prop({ type: String, default: null })
  parentId?: string | null;

  @Prop({
    type: String,
    enum: ['men', 'women', 'kids', 'unisex'],
    default: 'unisex',
  })
  department: Department;

  @Prop({ default: 0 })
  sortOrder: number;

  @Prop({ default: true, index: true })
  isActive: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

export const CategorySchema = SchemaFactory.createForClass(CategorySchemaClass);
