import { Injectable } from '@nestjs/common';
import { PlatformCommission } from './domain/platform-commission';
import { PlatformCommissionRepository } from './infrastructure/persistence/platform-commission.repository';

// Preserves the rate every vendor was defaulted to before this became
// admin-configurable (see git history on Vendor.commissionStructure).
const DEFAULT_COMMISSION_PERCENTAGE = 15;

@Injectable()
export class CommissionService {
  constructor(
    private readonly commissionRepository: PlatformCommissionRepository,
  ) {}

  async getOrDefault(): Promise<PlatformCommission> {
    const existing = await this.commissionRepository.get();
    if (existing) return existing;

    const fallback = new PlatformCommission();
    fallback.percentage = DEFAULT_COMMISSION_PERCENTAGE;
    return fallback;
  }

  // Used by OrdersService.buildOrderDrafts — every vendor's order snapshots
  // the same rate, so this is the one call site checkout needs.
  async getPercentage(): Promise<number> {
    const commission = await this.getOrDefault();
    return commission.percentage;
  }

  update(percentage: number, adminId: string): Promise<PlatformCommission> {
    return this.commissionRepository.set(percentage, adminId);
  }
}
