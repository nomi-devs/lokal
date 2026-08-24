import { NullableType } from '../../../utils/types/nullable.type';
import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { Setting } from '../../domain/setting';

export abstract class SettingRepository {
  abstract create(
    data: Omit<Setting, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Setting>;

  abstract findAll(): Promise<Setting[]>;
  abstract findByKey(key: string): Promise<NullableType<Setting>>;

  abstract update(
    key: string,
    payload: DeepPartial<Setting>,
  ): Promise<NullableType<Setting>>;

  abstract remove(key: string): Promise<void>;
}
