import { NullableType } from '../../../utils/types/nullable.type';
import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { Address } from '../../domain/address';

export abstract class AddressRepository {
  abstract create(
    data: Omit<Address, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Address>;

  abstract findById(id: string): Promise<NullableType<Address>>;

  abstract findManyByUserId(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ data: Address[]; total: number }>;

  abstract update(
    id: string,
    payload: DeepPartial<Address>,
  ): Promise<NullableType<Address>>;
  abstract remove(id: string): Promise<void>;

  abstract countByUserId(userId: string): Promise<number>;

  abstract unsetPrimaryForUser(
    userId: string,
    exceptId?: string,
  ): Promise<void>;
}
