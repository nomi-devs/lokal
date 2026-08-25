import { PlatformCommission } from '../../../../domain/platform-commission';
import { PlatformCommissionSchemaClass } from '../entities/platform-commission.schema';

export class PlatformCommissionMapper {
  static toDomain(raw: PlatformCommissionSchemaClass): PlatformCommission {
    const entity = new PlatformCommission();
    entity.percentage = raw.percentage;
    entity.updatedBy = raw.updatedBy?.toString();
    entity.updatedAt = raw.updatedAt;
    return entity;
  }
}
