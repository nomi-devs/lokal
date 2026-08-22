import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { EntityDocumentHelper } from '../../../../../utils/document-entity-helper';

export type FileSchemaDocument = HydratedDocument<FileSchemaClass>;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class FileSchemaClass extends EntityDocumentHelper {
  @Prop({ required: true })
  key: string;

  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  contentType: string;

  @Prop()
  purpose?: string;

  @Prop({ type: Types.ObjectId, ref: 'UserSchemaClass', required: true })
  uploadedBy: Types.ObjectId;

  createdAt?: Date;
}

export const FileSchema = SchemaFactory.createForClass(FileSchemaClass);
