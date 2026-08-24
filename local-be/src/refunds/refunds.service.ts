import { Injectable } from '@nestjs/common';
import { AppException } from '../common/exceptions/app.exception';
import { ERROR_CODES } from '../common/exceptions/error-codes';
import { OrdersService } from '../orders/orders.service';
import { UsersService } from '../users/users.service';
import { Refund } from './domain/refund';
import { RefundStatus } from './refunds.constants';
import {
  AdminListRefundsFilters,
  RefundRepository,
} from './infrastructure/persistence/refund.repository';
import { CreateRefundDto } from './dto/create-refund.dto';
import { ModerateRefundDto } from './dto/moderate-refund.dto';

export interface RefundWithContext extends Refund {
  orderNumber: string;
  orderTotal: number;
  customerName: string;
  customerEmail?: string;
}

// requested -> approved -> completed, or requested -> rejected. 'rejected'
// and 'completed' are terminal.
const ALLOWED_TRANSITIONS: Record<RefundStatus, RefundStatus[]> = {
  requested: ['approved', 'rejected'],
  approved: ['completed'],
  rejected: [],
  completed: [],
};

@Injectable()
export class RefundsService {
  constructor(
    private readonly refundRepository: RefundRepository,
    private readonly ordersService: OrdersService,
    private readonly usersService: UsersService,
  ) {}

  // Only a delivered order is eligible, refundAmount is capped at what was
  // actually paid, and only one request is allowed per order — see the
  // unique index on RefundSchemaClass.orderId.
  async submit(customerId: string, dto: CreateRefundDto): Promise<Refund> {
    const order = await this.ordersService.getForCustomerOrThrow(
      customerId,
      dto.orderId,
    );
    if (order.status !== 'delivered') {
      throw new AppException(
        ERROR_CODES.ORDER_NOT_DELIVERED,
        'Only delivered orders can be refunded',
        422,
      );
    }
    if (dto.refundAmount > order.total) {
      throw new AppException(
        ERROR_CODES.REFUND_AMOUNT_EXCEEDS_ORDER_TOTAL,
        'Refund amount cannot exceed the order total',
        422,
      );
    }

    const existing = await this.refundRepository.findOneByOrderId(dto.orderId);
    if (existing) {
      throw new AppException(
        ERROR_CODES.REFUND_ALREADY_EXISTS,
        'A refund request already exists for this order',
        409,
      );
    }

    return this.refundRepository.create({
      orderId: dto.orderId,
      customerId,
      refundAmount: dto.refundAmount,
      refundReason: dto.refundReason,
      customerExplanation: dto.customerExplanation,
      bankAccount: dto.bankAccount,
    });
  }

  async listMine(
    customerId: string,
    page: number,
    limit: number,
  ): Promise<{ data: RefundWithContext[]; total: number }> {
    const { data, total } = await this.refundRepository.findManyByCustomerId(
      customerId,
      page,
      limit,
    );
    return { data: await this.attachContext(data), total };
  }

  async getMineOrThrow(
    customerId: string,
    id: string,
  ): Promise<RefundWithContext> {
    const refund = await this.getOwnedByCustomerOrThrow(customerId, id);
    return this.attachContextOne(refund);
  }

  async listForAdmin(
    filters: AdminListRefundsFilters,
  ): Promise<{ data: RefundWithContext[]; total: number }> {
    const { data, total } =
      await this.refundRepository.findManyForAdmin(filters);
    return { data: await this.attachContext(data), total };
  }

  async getForAdminOrThrow(id: string): Promise<RefundWithContext> {
    const refund = await this.getOrThrow(id);
    return this.attachContextOne(refund);
  }

  async moderate(
    adminId: string,
    id: string,
    dto: ModerateRefundDto,
  ): Promise<RefundWithContext> {
    const refund = await this.getOrThrow(id);
    this.assertValidTransition(refund.status, dto.status);

    const payload: Partial<Refund> = { status: dto.status };
    if (dto.status === 'approved') {
      payload.approvedAt = new Date();
      payload.approvedBy = adminId;
      payload.approvalNotes = dto.approvalNotes;
    } else if (dto.status === 'rejected') {
      payload.rejectedAt = new Date();
      payload.rejectionReason = dto.rejectionReason;
      payload.rejectionCategory = dto.rejectionCategory;
    } else {
      payload.completedAt = new Date();
      payload.proofOfTransferUrl = dto.proofOfTransferUrl;
    }

    const updated = await this.refundRepository.update(id, payload);
    return this.attachContextOne(updated as Refund);
  }

  private assertValidTransition(
    current: RefundStatus,
    next: RefundStatus,
  ): void {
    if (!ALLOWED_TRANSITIONS[current].includes(next)) {
      throw new AppException(
        ERROR_CODES.REFUND_STATUS_TRANSITION_INVALID,
        `Cannot move a ${current} refund to ${next}`,
        422,
      );
    }
  }

  private async attachContext(refunds: Refund[]): Promise<RefundWithContext[]> {
    return Promise.all(refunds.map((r) => this.attachContextOne(r)));
  }

  private async attachContextOne(refund: Refund): Promise<RefundWithContext> {
    const [order, user] = await Promise.all([
      this.ordersService.getForAdminOrThrow(refund.orderId),
      this.usersService.findById(refund.customerId),
    ]);
    return Object.assign(new Refund(), refund, {
      orderNumber: order.orderNumber,
      orderTotal: order.total,
      customerName: user ? `${user.firstName} ${user.lastName}`.trim() : '',
      customerEmail: user?.email,
    });
  }

  private async getOwnedByCustomerOrThrow(
    customerId: string,
    id: string,
  ): Promise<Refund> {
    const refund = await this.refundRepository.findById(id);
    // 404 (not 403) for cross-customer access — same precedent as
    // AddressesService/ProductsService/ReviewsService.
    if (!refund || refund.customerId !== customerId) {
      throw new AppException(
        ERROR_CODES.REFUND_NOT_FOUND,
        'Refund not found',
        404,
      );
    }
    return refund;
  }

  private async getOrThrow(id: string): Promise<Refund> {
    const refund = await this.refundRepository.findById(id);
    if (!refund) {
      throw new AppException(
        ERROR_CODES.REFUND_NOT_FOUND,
        'Refund not found',
        404,
      );
    }
    return refund;
  }
}
