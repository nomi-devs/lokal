import { NullableType } from '../../../utils/types/nullable.type';
import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { Order } from '../../domain/order';

export interface ListOrdersFilters {
  page: number;
  limit: number;
  customerId?: string;
  storeId?: string;
  status?: string[];
}

export abstract class OrderRepository {
  abstract create(
    data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Order>;

  abstract findById(id: string): Promise<NullableType<Order>>;

  abstract findManyByCheckoutSessionId(
    checkoutSessionId: string,
  ): Promise<Order[]>;

  abstract findManyWithPagination(
    filters: ListOrdersFilters,
  ): Promise<{ data: Order[]; total: number }>;

  abstract update(
    id: string,
    payload: DeepPartial<Order>,
  ): Promise<NullableType<Order>>;
}
