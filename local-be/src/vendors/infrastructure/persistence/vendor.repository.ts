import { NullableType } from '../../../utils/types/nullable.type';
import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { VendorStatus } from '../../../common/constants/auth.constants';
import { Vendor } from '../../domain/vendor';

export interface ListVendorsFilters {
  page: number;
  limit: number;
  status?: string;
  search?: string;
}

export abstract class VendorRepository {
  abstract create(
    data: Omit<Vendor, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Vendor>;

  abstract findById(id: string): Promise<NullableType<Vendor>>;
  abstract findByUserId(userId: string): Promise<NullableType<Vendor>>;
  abstract findByStoreName(storeName: string): Promise<NullableType<Vendor>>;
  abstract findManyByUserIds(userIds: string[]): Promise<Vendor[]>;

  abstract update(
    id: string,
    payload: DeepPartial<Vendor>,
  ): Promise<NullableType<Vendor>>;
  abstract updateByUserId(
    userId: string,
    payload: DeepPartial<Vendor>,
  ): Promise<NullableType<Vendor>>;
  abstract remove(id: string): Promise<void>;

  abstract findManyWithPagination(
    filters: ListVendorsFilters,
  ): Promise<{ data: Vendor[]; total: number }>;

  abstract countByStatus(status: VendorStatus): Promise<number>;
  abstract countCreatedSince(since: Date): Promise<number>;
  abstract countAll(): Promise<number>;
}
