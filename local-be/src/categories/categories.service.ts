import { Injectable } from '@nestjs/common';
import { NullableType } from '../utils/types/nullable.type';
import { AppException } from '../common/exceptions/app.exception';
import { ERROR_CODES } from '../common/exceptions/error-codes';
import { Category } from './domain/category';
import { CategoryRepository } from './infrastructure/persistence/category.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  create(dto: CreateCategoryDto): Promise<Category> {
    return this.categoryRepository.create({
      nameEn: dto.nameEn,
      nameAr: dto.nameAr,
      descriptionEn: dto.descriptionEn,
      descriptionAr: dto.descriptionAr,
      imageUrl: dto.imageUrl,
      parentId: dto.parentId ?? null,
      department: dto.department ?? 'unisex',
      sortOrder: dto.sortOrder ?? 0,
      isActive: dto.isActive ?? true,
    });
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    await this.getOrThrow(id);
    const updated = await this.categoryRepository.update(id, dto);
    return updated as Category;
  }

  findById(id: string): Promise<NullableType<Category>> {
    return this.categoryRepository.findById(id);
  }

  list(
    page: number,
    limit: number,
  ): Promise<{ data: Category[]; total: number }> {
    return this.categoryRepository.findAll(page, limit);
  }

  findActive(
    page: number,
    limit: number,
  ): Promise<{ data: Category[]; total: number }> {
    return this.categoryRepository.findActive(page, limit);
  }

  async delete(id: string): Promise<void> {
    await this.getOrThrow(id);
    await this.categoryRepository.remove(id);
  }

  private async getOrThrow(id: string): Promise<Category> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new AppException(
        ERROR_CODES.CATEGORY_NOT_FOUND,
        'Category not found',
        404,
      );
    }
    return category;
  }
}
