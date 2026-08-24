import { ApiProperty } from '@nestjs/swagger';
import { REFUND_STATUSES } from '../refunds.constants';
import type { RefundStatus } from '../refunds.constants';

class RefundBankAccount {
  @ApiProperty() accountHolder: string;
  @ApiProperty() accountNumber: string;
  @ApiProperty() bankName: string;
  @ApiProperty({ required: false }) bankCode?: string;
}

export class Refund {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  orderId: string;

  @ApiProperty({ type: String })
  customerId: string;

  @ApiProperty()
  refundAmount: number;

  @ApiProperty()
  refundReason: string;

  @ApiProperty({ required: false })
  customerExplanation?: string;

  @ApiProperty({ type: RefundBankAccount })
  bankAccount: RefundBankAccount;

  @ApiProperty({ enum: REFUND_STATUSES })
  status: RefundStatus;

  @ApiProperty({ type: Date, nullable: true })
  approvedAt?: Date;

  @ApiProperty({ type: String, nullable: true })
  approvedBy?: string;

  @ApiProperty({ type: String, nullable: true })
  approvalNotes?: string;

  @ApiProperty({ type: Date, nullable: true })
  rejectedAt?: Date;

  @ApiProperty({ type: String, nullable: true })
  rejectionReason?: string;

  @ApiProperty({ type: String, nullable: true })
  rejectionCategory?: string;

  @ApiProperty({ type: String, nullable: true })
  proofOfTransferUrl?: string;

  @ApiProperty({ type: Date, nullable: true })
  completedAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
