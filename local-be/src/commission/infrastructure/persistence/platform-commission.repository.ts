import { NullableType } from '../../../utils/types/nullable.type';
import { PlatformCommission } from '../../domain/platform-commission';

export abstract class PlatformCommissionRepository {
  abstract get(): Promise<NullableType<PlatformCommission>>;

  abstract set(
    percentage: number,
    updatedBy: string,
  ): Promise<PlatformCommission>;
}
