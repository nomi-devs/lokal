import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter, Types } from 'mongoose';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { DeepPartial } from '../../../../../utils/types/deep-partial.type';
import { Product } from '../../../../domain/product';
import {
  ListProductsFilters,
  ListPublicProductsFilters,
  ProductRepository,
} from '../../product.repository';
import {
  ProductSchemaClass,
  ProductSchemaDocument,
} from '../entities/product.schema';
import { ProductMapper } from '../mappers/product.mapper';

@Injectable()
export class ProductsDocumentRepository implements ProductRepository {
  constructor(
    @InjectModel(ProductSchemaClass.name)
    private readonly productModel: Model<ProductSchemaDocument>,
  ) {}

  async create(
    data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Product> {
    const created = await this.productModel.create(
      ProductMapper.toPersistence(data),
    );
    return ProductMapper.toDomain(created);
  }

  async findById(id: string): Promise<NullableType<Product>> {
    if (!Types.ObjectId.isValid(id)) return null;
    const found = await this.productModel.findOne({
      _id: id,
      deletedAt: { $exists: false },
    });
    return found ? ProductMapper.toDomain(found) : null;
  }

  async findManyByIds(ids: string[]): Promise<Product[]> {
    const validIds = ids.filter((id) => Types.ObjectId.isValid(id));
    const found = await this.productModel.find({
      _id: { $in: validIds },
      deletedAt: { $exists: false },
    });
    return found.map((p) => ProductMapper.toDomain(p));
  }

  async findManyByVendorId(
    vendorId: string,
    page: number,
    limit: number,
    categoryId?: string,
  ): Promise<{ data: Product[]; total: number }> {
    const query: QueryFilter<ProductSchemaDocument> = {
      vendorId: new Types.ObjectId(vendorId),
      deletedAt: { $exists: false },
    };
    if (categoryId) query.categoryId = categoryId;

    const [data, total] = await Promise.all([
      this.productModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      this.productModel.countDocuments(query),
    ]);

    return { data: data.map((p) => ProductMapper.toDomain(p)), total };
  }

  async findManyWithPagination(
    filters: ListProductsFilters,
  ): Promise<{ data: Product[]; total: number }> {
    const query: QueryFilter<ProductSchemaDocument> = {
      deletedAt: { $exists: false },
    };
    if (filters.vendorId) query.vendorId = new Types.ObjectId(filters.vendorId);
    if (filters.categoryId) query.categoryId = filters.categoryId;
    if (filters.status) query.status = filters.status;
    if (filters.search) {
      query.$or = [
        { 'name.en': { $regex: filters.search, $options: 'i' } },
        { 'name.ar': { $regex: filters.search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.productModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip((filters.page - 1) * filters.limit)
        .limit(filters.limit),
      this.productModel.countDocuments(query),
    ]);

    return { data: data.map((p) => ProductMapper.toDomain(p)), total };
  }

  async findPublicWithPagination(
    filters: ListPublicProductsFilters,
  ): Promise<{ data: Product[]; total: number }> {
    const query: QueryFilter<ProductSchemaDocument> = {
      deletedAt: { $exists: false },
      status: 'active',
      vendorId: { $in: filters.vendorIds.map((id) => new Types.ObjectId(id)) },
    };
    if (filters.categoryId) query.categoryId = filters.categoryId;
    if (filters.gender) query.gender = filters.gender;
    if (filters.color) query.colors = filters.color;
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      query.price = {};
      if (filters.minPrice !== undefined) query.price.$gte = filters.minPrice;
      if (filters.maxPrice !== undefined) query.price.$lte = filters.maxPrice;
    }
    if (filters.search) {
      query.$or = [
        { 'name.en': { $regex: filters.search, $options: 'i' } },
        { 'name.ar': { $regex: filters.search, $options: 'i' } },
      ];
    }

    const sortField: keyof ProductSchemaClass = (() => {
      switch (filters.sort) {
        case 'price_asc':
        case 'price_desc':
          return 'price';
        case 'rating':
          return 'rating';
        case 'popular':
          return 'salesCount';
        case 'newest':
        default:
          return 'createdAt';
      }
    })();
    const sortDirection: 1 | -1 = filters.sort === 'price_asc' ? 1 : -1;
    const sort: Record<string, 1 | -1> = { [sortField]: sortDirection };

    const [data, total] = await Promise.all([
      this.productModel
        .find(query)
        .sort(sort)
        .skip((filters.page - 1) * filters.limit)
        .limit(filters.limit),
      this.productModel.countDocuments(query),
    ]);

    return { data: data.map((p) => ProductMapper.toDomain(p)), total };
  }

  async update(
    id: string,
    payload: DeepPartial<Product>,
  ): Promise<NullableType<Product>> {
    const updated = await this.productModel.findOneAndUpdate(
      { _id: id },
      ProductMapper.toPersistence(payload as Partial<Product>),
      { new: true },
    );
    return updated ? ProductMapper.toDomain(updated) : null;
  }

  async remove(id: string): Promise<void> {
    await this.productModel.updateOne({ _id: id }, { deletedAt: new Date() });
  }

  async incrementViewCount(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) return;
    await this.productModel.updateOne({ _id: id }, { $inc: { viewCount: 1 } });
  }

  async countByVendorId(vendorId: string): Promise<number> {
    return this.productModel.countDocuments({
      vendorId: new Types.ObjectId(vendorId),
      deletedAt: { $exists: false },
    });
  }
}
