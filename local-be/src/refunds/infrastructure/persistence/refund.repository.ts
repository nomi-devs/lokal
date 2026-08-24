import { NullableType } from '../../../utils/types/nullable.type';
import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { Refund } from '../../domain/refund';

export interface AdminListRefundsFilters {
  page: number;
  limit: number;
  status?: string;
}

export abstract class RefundRepository {
  abstract create(
    data: Omit<Refund, 'id' | 'createdAt' | 'updatedAt' | 'status'>,
  ): Promise<Refund>;

  abstract findById(id: string): Promise<NullableType<Refund>>;
  abstract findOneByOrderId(orderId: string): Promise<NullableType<Refund>>;

  abstract findManyByCustomerId(
    customerId: string,
    page: number,
    limit: number,
  ): Promise<{ data: Refund[]; total: number }>;

  abstract findManyForAdmin(
    filters: AdminListRefundsFilters,
  ): Promise<{ data: Refund[]; total: number }>;

  abstract update(
    id: string,
    payload: DeepPartial<Refund>,
  ): Promise<NullableType<Refund>>;
}
