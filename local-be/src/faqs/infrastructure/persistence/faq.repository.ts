import { NullableType } from '../../../utils/types/nullable.type';
import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { Faq } from '../../domain/faq';

export abstract class FaqRepository {
  abstract create(
    data: Omit<Faq, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Faq>;
  abstract findById(id: string): Promise<NullableType<Faq>>;
  abstract findAll(
    page: number,
    limit: number,
  ): Promise<{ data: Faq[]; total: number }>;
  abstract findActive(): Promise<Faq[]>;
  abstract update(
    id: string,
    payload: DeepPartial<Faq>,
  ): Promise<NullableType<Faq>>;
  abstract remove(id: string): Promise<void>;
}
