import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { v4 as uuid } from 'uuid';
import { EntityDocumentHelper } from '../../../../../utils/document-entity-helper';

export type BannerSchemaDocument = HydratedDocument<BannerSchemaClass>;

@Schema({ timestamps: true })
export class BannerSchemaClass extends EntityDocumentHelper {
  @Prop({ type: String, default: () => uuid() })
  declare _id: string;

  @Prop({ required: true })
  imageUrl: string;

  @Prop()
  titleEn?: string;

  @Prop()
  titleAr?: string;

  @Prop()
  linkUrl?: string;

  @Prop({ default: 0 })
  sortOrder: number;

  @Prop({ default: true, index: true })
  isActive: boolean;

  @Prop()
  startDate?: Date;

  @Prop()
  endDate?: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

export const BannerSchema = SchemaFactory.createForClass(BannerSchemaClass);
