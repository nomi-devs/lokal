import { NullableType } from '../../../utils/types/nullable.type';
import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { Product } from '../../domain/product';

export interface ListProductsFilters {
  page: number;
  limit: number;
  vendorId?: string;
  categoryId?: string;
  status?: string;
  search?: string;
}

export interface ListPublicProductsFilters {
  page: number;
  limit: number;
  vendorIds: string[];
  categoryId?: string;
  gender?: string;
  color?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'rating' | 'popular';
}

export abstract class ProductRepository {
  abstract create(
    data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Product>;

  abstract findById(id: string): Promise<NullableType<Product>>;
  abstract findManyByIds(ids: string[]): Promise<Product[]>;

  abstract findManyByVendorId(
    vendorId: string,
    page: number,
    limit: number,
    categoryId?: string,
  ): Promise<{ data: Product[]; total: number }>;

  abstract findManyWithPagination(
    filters: ListProductsFilters,
  ): Promise<{ data: Product[]; total: number }>;

  abstract findPublicWithPagination(
    filters: ListPublicProductsFilters,
  ): Promise<{ data: Product[]; total: number }>;

  abstract update(
    id: string,
    payload: DeepPartial<Product>,
  ): Promise<NullableType<Product>>;
  abstract remove(id: string): Promise<void>;

  abstract incrementViewCount(id: string): Promise<void>;

  abstract countByVendorId(vendorId: string): Promise<number>;
}
