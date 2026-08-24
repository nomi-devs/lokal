import { NullableType } from '../../../utils/types/nullable.type';
import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { PromoCode } from '../../domain/promo-code';

export interface ListPromoCodesFilters {
  page: number;
  limit: number;
  isActive?: boolean;
  search?: string;
}

export abstract class PromoCodeRepository {
  abstract create(
    data: Omit<
      PromoCode,
      'id' | 'createdAt' | 'updatedAt' | 'currentUsageCount'
    >,
  ): Promise<PromoCode>;

  abstract findById(id: string): Promise<NullableType<PromoCode>>;
  abstract findByCode(code: string): Promise<NullableType<PromoCode>>;

  abstract findManyWithPagination(
    filters: ListPromoCodesFilters,
  ): Promise<{ data: PromoCode[]; total: number }>;

  abstract update(
    id: string,
    payload: DeepPartial<PromoCode>,
  ): Promise<NullableType<PromoCode>>;

  abstract remove(id: string): Promise<void>;
}
