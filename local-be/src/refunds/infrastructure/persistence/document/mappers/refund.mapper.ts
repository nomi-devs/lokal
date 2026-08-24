import { Types } from 'mongoose';
import { Refund } from '../../../../domain/refund';
import { RefundStatus } from '../../../../refunds.constants';
import { RefundSchemaClass } from '../entities/refund.schema';

export class RefundMapper {
  static toDomain(raw: RefundSchemaClass): Refund {
    const entity = new Refund();
    entity.id = raw._id.toString();
    entity.orderId = raw.orderId.toString();
    entity.customerId = raw.customerId.toString();
    entity.refundAmount = raw.refundAmount;
    entity.refundReason = raw.refundReason;
    entity.customerExplanation = raw.customerExplanation;
    entity.bankAccount = {
      accountHolder: raw.bankAccount?.accountHolder ?? '',
      accountNumber: raw.bankAccount?.accountNumber ?? '',
      bankName: raw.bankAccount?.bankName ?? '',
      bankCode: raw.bankAccount?.bankCode,
    };
    entity.status = raw.status as RefundStatus;
    entity.approvedAt = raw.approvedAt;
    entity.approvedBy = raw.approvedBy?.toString();
    entity.approvalNotes = raw.approvalNotes;
    entity.rejectedAt = raw.rejectedAt;
    entity.rejectionReason = raw.rejectionReason;
    entity.rejectionCategory = raw.rejectionCategory;
    entity.proofOfTransferUrl = raw.proofOfTransferUrl;
    entity.completedAt = raw.completedAt;
    entity.createdAt = raw.createdAt as Date;
    entity.updatedAt = raw.updatedAt as Date;
    return entity;
  }

  static toPersistence(domain: Partial<Refund>): Partial<RefundSchemaClass> {
    const doc: Partial<RefundSchemaClass> = {};
    if (domain.orderId !== undefined)
      doc.orderId = new Types.ObjectId(domain.orderId);
    if (domain.customerId !== undefined)
      doc.customerId = new Types.ObjectId(domain.customerId);
    if (domain.refundAmount !== undefined)
      doc.refundAmount = domain.refundAmount;
    if (domain.refundReason !== undefined)
      doc.refundReason = domain.refundReason;
    if (domain.customerExplanation !== undefined)
      doc.customerExplanation = domain.customerExplanation;
    if (domain.bankAccount !== undefined) doc.bankAccount = domain.bankAccount;
    if (domain.status !== undefined) doc.status = domain.status;
    if (domain.approvedAt !== undefined) doc.approvedAt = domain.approvedAt;
    if (domain.approvedBy !== undefined)
      doc.approvedBy = new Types.ObjectId(domain.approvedBy);
    if (domain.approvalNotes !== undefined)
      doc.approvalNotes = domain.approvalNotes;
    if (domain.rejectedAt !== undefined) doc.rejectedAt = domain.rejectedAt;
    if (domain.rejectionReason !== undefined)
      doc.rejectionReason = domain.rejectionReason;
    if (domain.rejectionCategory !== undefined)
      doc.rejectionCategory = domain.rejectionCategory;
    if (domain.proofOfTransferUrl !== undefined)
      doc.proofOfTransferUrl = domain.proofOfTransferUrl;
    if (domain.completedAt !== undefined) doc.completedAt = domain.completedAt;
    return doc;
  }
}
