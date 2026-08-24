import { Injectable } from '@nestjs/common';
import { AppException } from '../common/exceptions/app.exception';
import { ERROR_CODES } from '../common/exceptions/error-codes';
import { PromoCode } from './domain/promo-code';
import {
  ListPromoCodesFilters,
  PromoCodeRepository,
} from './infrastructure/persistence/promo-code.repository';
import { CreatePromoCodeDto } from './dto/create-promo-code.dto';
import { UpdatePromoCodeDto } from './dto/update-promo-code.dto';

@Injectable()
export class PromoCodesService {
  constructor(private readonly promoCodeRepository: PromoCodeRepository) {}

  async create(adminId: string, dto: CreatePromoCodeDto): Promise<PromoCode> {
    const code = dto.code.toUpperCase();
    const existing = await this.promoCodeRepository.findByCode(code);
    if (existing) {
      throw new AppException(
        ERROR_CODES.PROMO_CODE_EXISTS,
        'Promo code already exists',
        409,
      );
    }
    this.assertValidWindow(dto.validFrom, dto.validUntil);

    return this.promoCodeRepository.create({
      code,
      discountType: dto.discountType,
      discountValue: dto.discountValue,
      maxUsageCount: dto.maxUsageCount,
      applicableVendorIds: dto.applicableVendorIds ?? [],
      applicableCategoryIds: dto.applicableCategoryIds ?? [],
      minOrderValue: dto.minOrderValue,
      maxDiscountCap: dto.maxDiscountCap,
      validFrom: new Date(dto.validFrom),
      validUntil: new Date(dto.validUntil),
      isActive: dto.isActive ?? true,
      createdBy: adminId,
    });
  }

  async update(
    adminId: string,
    id: string,
    dto: UpdatePromoCodeDto,
  ): Promise<PromoCode> {
    const existing = await this.getOrThrow(id);
    this.assertValidWindow(
      dto.validFrom ?? existing.validFrom.toISOString(),
      dto.validUntil ?? existing.validUntil.toISOString(),
    );

    const updated = await this.promoCodeRepository.update(id, {
      ...dto,
      validFrom: dto.validFrom ? new Date(dto.validFrom) : undefined,
      validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined,
      updatedBy: adminId,
    });
    return updated as PromoCode;
  }

  findById(id: string) {
    return this.promoCodeRepository.findById(id);
  }

  list(
    filters: ListPromoCodesFilters,
  ): Promise<{ data: PromoCode[]; total: number }> {
    return this.promoCodeRepository.findManyWithPagination(filters);
  }

  async remove(id: string): Promise<void> {
    await this.getOrThrow(id);
    await this.promoCodeRepository.remove(id);
  }

  private assertValidWindow(validFrom: string, validUntil: string): void {
    if (new Date(validFrom) >= new Date(validUntil)) {
      throw new AppException(
        ERROR_CODES.VALIDATION_ERROR,
        'validUntil must be after validFrom',
        422,
        [{ field: 'validUntil', message: 'must be after validFrom' }],
      );
    }
  }

  private async getOrThrow(id: string): Promise<PromoCode> {
    const promoCode = await this.promoCodeRepository.findById(id);
    if (!promoCode) {
      throw new AppException(
        ERROR_CODES.PROMO_CODE_NOT_FOUND,
        'Promo code not found',
        404,
      );
    }
    return promoCode;
  }
}
