import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { v4 as uuid } from 'uuid';
import { EntityDocumentHelper } from '../../../../../utils/document-entity-helper';

export type SettingSchemaDocument = HydratedDocument<SettingSchemaClass>;

@Schema({ timestamps: true })
export class SettingSchemaClass extends EntityDocumentHelper {
  @Prop({ type: String, default: () => uuid() })
  declare _id: string;

  @Prop({ required: true, unique: true, index: true })
  key: string;

  @Prop({ type: Object, required: true })
  value: string | number | boolean;

  @Prop({ enum: ['number', 'string', 'boolean', 'json'], required: true })
  type: string;

  @Prop({
    enum: [
      'payment',
      'shipping',
      'commission',
      'sms',
      'auth',
      'general',
      'support',
    ],
    required: true,
  })
  category: string;

  @Prop({ required: true })
  descriptionEn: string;

  @Prop()
  descriptionAr?: string;

  @Prop({ type: Types.ObjectId, ref: 'UserSchemaClass' })
  updatedBy?: Types.ObjectId;

  createdAt?: Date;
  updatedAt?: Date;
}

export const SettingSchema = SchemaFactory.createForClass(SettingSchemaClass);
