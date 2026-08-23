import { Injectable } from '@nestjs/common';
import { NullableType } from '../utils/types/nullable.type';
import { Product } from './domain/product';
import { ProductRepository } from './infrastructure/persistence/product.repository';

@Injectable()
export class ProductsService {
  constructor(private readonly productRepository: ProductRepository) {}

  findById(id: string): Promise<NullableType<Product>> {
    return this.productRepository.findById(id);
  }

  findManyByIds(ids: string[]): Promise<Product[]> {
    return this.productRepository.findManyByIds(ids);
  }

  findManyByVendorId(
    vendorId: string,
    page: number,
    limit: number,
  ): Promise<{ data: Product[]; total: number }> {
    return this.productRepository.findManyByVendorId(vendorId, page, limit);
  }

  countByVendorId(vendorId: string): Promise<number> {
    return this.productRepository.countByVendorId(vendorId);
  }
}
