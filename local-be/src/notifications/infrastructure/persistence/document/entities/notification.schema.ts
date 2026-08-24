import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { EntityDocumentHelper } from '../../../../../utils/document-entity-helper';
import {
  NOTIFICATION_TYPES,
  PUSH_STATUSES,
} from '../../../../notifications.constants';
import type {
  NotificationType,
  PushStatus,
} from '../../../../notifications.constants';

export type NotificationSchemaDocument =
  HydratedDocument<NotificationSchemaClass>;

@Schema({ timestamps: true })
export class NotificationSchemaClass extends EntityDocumentHelper {
  @Prop({
    type: Types.ObjectId,
    ref: 'UserSchemaClass',
    required: true,
    index: true,
  })
  userId: Types.ObjectId;

  @Prop({ enum: NOTIFICATION_TYPES, required: true, index: true })
  type: NotificationType;

  @Prop({ required: true })
  title: string;

  @Prop()
  titleAr?: string;

  @Prop({ required: true })
  body: string;

  @Prop()
  bodyAr?: string;

  @Prop({ type: MongooseSchema.Types.Mixed, default: null })
  data?: Record<string, unknown> | null;

  @Prop({ default: false, index: true })
  isRead: boolean;

  @Prop()
  readAt?: Date;

  @Prop({ enum: PUSH_STATUSES })
  pushStatus?: PushStatus;

  createdAt?: Date;
  updatedAt?: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(
  NotificationSchemaClass,
);

NotificationSchema.index({ userId: 1, createdAt: -1 });
