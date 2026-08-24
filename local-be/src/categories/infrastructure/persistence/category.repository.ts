import { NullableType } from '../../../utils/types/nullable.type';
import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { Category } from '../../domain/category';

export abstract class CategoryRepository {
  abstract create(
    data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Category>;

  abstract findById(id: string): Promise<NullableType<Category>>;
  abstract findAll(
    page: number,
    limit: number,
  ): Promise<{ data: Category[]; total: number }>;
  abstract findActive(
    page: number,
    limit: number,
  ): Promise<{ data: Category[]; total: number }>;

  abstract update(
    id: string,
    payload: DeepPartial<Category>,
  ): Promise<NullableType<Category>>;

  abstract remove(id: string): Promise<void>;
}
