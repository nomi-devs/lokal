import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { EntityDocumentHelper } from '../../../../../utils/document-entity-helper';
import { REFUND_STATUSES } from '../../../../refunds.constants';

export type RefundSchemaDocument = HydratedDocument<RefundSchemaClass>;

class RefundBankAccountSchema {
  @Prop({ required: true }) accountHolder: string;
  @Prop({ required: true }) accountNumber: string;
  @Prop({ required: true }) bankName: string;
  @Prop() bankCode?: string;
}

@Schema({ timestamps: true })
export class RefundSchemaClass extends EntityDocumentHelper {
  @Prop({
    type: Types.ObjectId,
    ref: 'OrderSchemaClass',
    required: true,
    unique: true,
    index: true,
  })
  orderId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'UserSchemaClass',
    required: true,
    index: true,
  })
  customerId: Types.ObjectId;

  @Prop({ required: true })
  refundAmount: number;

  @Prop({ required: true })
  refundReason: string;

  @Prop()
  customerExplanation?: string;

  @Prop({ type: RefundBankAccountSchema, required: true })
  bankAccount: RefundBankAccountSchema;

  @Prop({
    enum: REFUND_STATUSES,
    default: 'requested',
    required: true,
    index: true,
  })
  status: string;

  @Prop()
  approvedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'UserSchemaClass' })
  approvedBy?: Types.ObjectId;

  @Prop()
  approvalNotes?: string;

  @Prop()
  rejectedAt?: Date;

  @Prop()
  rejectionReason?: string;

  @Prop()
  rejectionCategory?: string;

  @Prop()
  proofOfTransferUrl?: string;

  @Prop()
  completedAt?: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

export const RefundSchema = SchemaFactory.createForClass(RefundSchemaClass);
