import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { v4 as uuid } from 'uuid';
import { EntityDocumentHelper } from '../../../../../utils/document-entity-helper';

export type FaqSchemaDocument = HydratedDocument<FaqSchemaClass>;

@Schema({ timestamps: true })
export class FaqSchemaClass extends EntityDocumentHelper {
  @Prop({ type: String, default: () => uuid() })
  declare _id: string;

  @Prop({ required: true })
  questionEn: string;

  @Prop({ required: true })
  questionAr: string;

  @Prop({ required: true })
  answerEn: string;

  @Prop({ required: true })
  answerAr: string;

  @Prop({ default: 0 })
  sortOrder: number;

  @Prop({ default: true, index: true })
  isActive: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

export const FaqSchema = SchemaFactory.createForClass(FaqSchemaClass);
