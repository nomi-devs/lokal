import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { EntityDocumentHelper } from '../../../../../utils/document-entity-helper';

export type WishlistSchemaDocument = HydratedDocument<WishlistSchemaClass>;

@Schema({ timestamps: true })
export class WishlistSchemaClass extends EntityDocumentHelper {
  @Prop({
    type: Types.ObjectId,
    ref: 'UserSchemaClass',
    required: true,
    index: true,
  })
  userId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'ProductSchemaClass',
    required: true,
  })
  productId: Types.ObjectId;

  createdAt?: Date;
  updatedAt?: Date;
}

export const WishlistSchema = SchemaFactory.createForClass(WishlistSchemaClass);

// One product can only appear once per user's wishlist.
WishlistSchema.index({ userId: 1, productId: 1 }, { unique: true });
