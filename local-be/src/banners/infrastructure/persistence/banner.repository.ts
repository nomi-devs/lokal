import { NullableType } from '../../../utils/types/nullable.type';
import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { Banner } from '../../domain/banner';

export abstract class BannerRepository {
  abstract create(
    data: Omit<Banner, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Banner>;
  abstract findById(id: string): Promise<NullableType<Banner>>;
  abstract findAll(
    page: number,
    limit: number,
  ): Promise<{ data: Banner[]; total: number }>;
  abstract findActive(): Promise<Banner[]>;
  abstract update(
    id: string,
    payload: DeepPartial<Banner>,
  ): Promise<NullableType<Banner>>;
  abstract remove(id: string): Promise<void>;
}
