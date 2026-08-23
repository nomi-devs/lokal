import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { EntityDocumentHelper } from '../../../../../utils/document-entity-helper';

export type AddressSchemaDocument = HydratedDocument<AddressSchemaClass>;

@Schema({ timestamps: true })
export class AddressSchemaClass extends EntityDocumentHelper {
  @Prop({
    type: Types.ObjectId,
    ref: 'UserSchemaClass',
    required: true,
    index: true,
  })
  userId: Types.ObjectId;

  @Prop({ enum: ['home', 'office', 'other'], default: 'home' })
  type: string;

  @Prop({ required: true })
  recipientName: string;

  @Prop({ required: true })
  country: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  address: string;

  @Prop({ default: false })
  isPrimary: boolean;

  @Prop({ default: false })
  isDefault: boolean;

  @Prop()
  deletedAt?: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

export const AddressSchema = SchemaFactory.createForClass(AddressSchemaClass);
