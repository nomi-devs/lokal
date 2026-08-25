import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { EntityDocumentHelper } from '../../../../../utils/document-entity-helper';

export type PlatformCommissionSchemaDocument =
  HydratedDocument<PlatformCommissionSchemaClass>;

// Single-document collection — every read/write goes through the fixed
// _id below (see PlatformCommissionDocumentRepository), so there is ever
// only one row, upserted in place rather than looked up by any query.
@Schema({ timestamps: true })
export class PlatformCommissionSchemaClass extends EntityDocumentHelper {
  @Prop({ type: String, default: 'global' })
  declare _id: string;

  @Prop({ required: true })
  percentage: number;

  @Prop({ type: Types.ObjectId, ref: 'UserSchemaClass' })
  updatedBy?: Types.ObjectId;

  createdAt?: Date;
  updatedAt?: Date;
}

export const PlatformCommissionSchema = SchemaFactory.createForClass(
  PlatformCommissionSchemaClass,
);
