import { Injectable } from '@nestjs/common';
import { NullableType } from '../utils/types/nullable.type';
import { AppException } from '../common/exceptions/app.exception';
import { ERROR_CODES } from '../common/exceptions/error-codes';
import { CategoriesService } from '../categories/categories.service';
import { VendorsService } from '../vendors/vendors.service';
import { Product } from './domain/product';
import {
  ListProductsFilters,
  ListPublicProductsFilters,
  ProductRepository,
} from './infrastructure/persistence/product.repository';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AdminUpdateProductDto } from './dto/admin-update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly categoriesService: CategoriesService,
    private readonly vendorsService: VendorsService,
  ) {}

  async createByVendor(
    vendorId: string,
    dto: CreateProductDto,
  ): Promise<Product> {
    await this.assertCategoryExists(dto.categoryId);
    this.assertValidPricing(dto.price, dto.compareAtPrice);

    const stock = dto.stock ?? 0;
    return this.productRepository.create({
      vendorId,
      categoryId: dto.categoryId,
      gender: dto.gender,
      name: dto.name,
      description: dto.description,
      images: dto.images,
      price: dto.price,
      compareAtPrice: dto.compareAtPrice,
      sizes: dto.sizes ?? [],
      colors: dto.colors ?? [],
      stock,
      inStock: dto.inStock ?? stock > 0,
      status: 'active',
      rating: 0,
      ratingCount: 0,
      salesCount: 0,
      viewCount: 0,
    });
  }

  async updateByVendor(
    vendorId: string,
    productId: string,
    dto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.getOwnedByVendorOrThrow(vendorId, productId);

    if (dto.categoryId !== undefined) {
      await this.assertCategoryExists(dto.categoryId);
    }
    this.assertValidPricing(
      dto.price ?? product.price,
      dto.compareAtPrice !== undefined
        ? dto.compareAtPrice
        : product.compareAtPrice,
    );

    const payload: Partial<Product> = { ...dto };
    if (dto.stock !== undefined && dto.inStock === undefined) {
      payload.inStock = dto.stock > 0;
    }

    const updated = await this.productRepository.update(productId, payload);
    return updated as Product;
  }

  async removeByVendor(vendorId: string, productId: string): Promise<void> {
    await this.getOwnedByVendorOrThrow(vendorId, productId);
    await this.productRepository.remove(productId);
  }

  listByVendor(
    vendorId: string,
    filters: Omit<ListProductsFilters, 'vendorId'>,
  ): Promise<{ data: Product[]; total: number }> {
    return this.productRepository.findManyWithPagination({
      ...filters,
      vendorId,
    });
  }

  listForAdmin(
    filters: ListProductsFilters,
  ): Promise<{ data: Product[]; total: number }> {
    return this.productRepository.findManyWithPagination(filters);
  }

  async updateByAdmin(
    id: string,
    dto: AdminUpdateProductDto,
  ): Promise<Product> {
    const product = await this.getOrThrow(id);

    if (dto.categoryId !== undefined) {
      await this.assertCategoryExists(dto.categoryId);
    }
    this.assertValidPricing(
      dto.price ?? product.price,
      dto.compareAtPrice !== undefined
        ? dto.compareAtPrice
        : product.compareAtPrice,
    );

    const payload: Partial<Product> = { ...dto };
    if (dto.stock !== undefined && dto.inStock === undefined) {
      payload.inStock = dto.stock > 0;
    }

    const updated = await this.productRepository.update(id, payload);
    return updated as Product;
  }

  async removeByAdmin(id: string): Promise<void> {
    await this.getOrThrow(id);
    await this.productRepository.remove(id);
  }

  async findPublicOne(id: string): Promise<Product> {
    const product = await this.productRepository.findById(id);
    if (!product || product.status !== 'active') {
      throw new AppException(
        ERROR_CODES.PRODUCT_NOT_FOUND,
        'Product not found',
        404,
      );
    }
    void this.productRepository.incrementViewCount(id);
    return product;
  }

  async listPublic(
    filters: Omit<ListPublicProductsFilters, 'vendorIds'>,
  ): Promise<{ data: Product[]; total: number }> {
    const vendorIds = await this.vendorsService.findActiveVendorIds();
    if (vendorIds.length === 0) return { data: [], total: 0 };
    return this.productRepository.findPublicWithPagination({
      ...filters,
      vendorIds,
    });
  }

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
    categoryId?: string,
  ): Promise<{ data: Product[]; total: number }> {
    return this.productRepository.findManyByVendorId(
      vendorId,
      page,
      limit,
      categoryId,
    );
  }

  countByVendorId(vendorId: string): Promise<number> {
    return this.productRepository.countByVendorId(vendorId);
  }

  private async getOwnedByVendorOrThrow(
    vendorId: string,
    productId: string,
  ): Promise<Product> {
    const product = await this.productRepository.findById(productId);
    // 404 (not 403) for cross-vendor access — avoids leaking whether another
    // vendor's product exists.
    if (!product || product.vendorId !== vendorId) {
      throw new AppException(
        ERROR_CODES.PRODUCT_NOT_FOUND,
        'Product not found',
        404,
      );
    }
    return product;
  }

  private async getOrThrow(id: string): Promise<Product> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new AppException(
        ERROR_CODES.PRODUCT_NOT_FOUND,
        'Product not found',
        404,
      );
    }
    return product;
  }

  private async assertCategoryExists(categoryId: string): Promise<void> {
    const category = await this.categoriesService.findById(categoryId);
    if (!category) {
      throw new AppException(
        ERROR_CODES.CATEGORY_NOT_FOUND,
        'Category not found',
        404,
      );
    }
  }

  private assertValidPricing(price: number, compareAtPrice?: number): void {
    if (price <= 0) {
      throw new AppException(
        ERROR_CODES.VALIDATION_ERROR,
        'price must be greater than 0',
        422,
        [{ field: 'price', message: 'price must be greater than 0' }],
      );
    }
    if (compareAtPrice !== undefined && compareAtPrice <= price) {
      throw new AppException(
        ERROR_CODES.VALIDATION_ERROR,
        'compareAtPrice must be greater than price',
        422,
        [
          {
            field: 'compareAtPrice',
            message: 'compareAtPrice must be greater than price',
          },
        ],
      );
    }
  }
}
