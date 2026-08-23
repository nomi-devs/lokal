import { NullableType } from '../../../utils/types/nullable.type';
import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { Product } from '../../domain/product';

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
  ): Promise<{ data: Product[]; total: number }>;

  abstract update(
    id: string,
    payload: DeepPartial<Product>,
  ): Promise<NullableType<Product>>;
  abstract remove(id: string): Promise<void>;

  abstract countByVendorId(vendorId: string): Promise<number>;
}
