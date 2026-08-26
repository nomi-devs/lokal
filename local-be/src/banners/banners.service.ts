import { Injectable } from '@nestjs/common';
import { NullableType } from '../utils/types/nullable.type';
import { ERROR_CODES } from '../common/exceptions/error-codes';
import { findOrThrow } from '../common/utils/find-or-throw.util';
import { Banner } from './domain/banner';
import { BannerRepository } from './infrastructure/persistence/banner.repository';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

@Injectable()
export class BannersService {
  constructor(private readonly bannerRepository: BannerRepository) {}

  create(dto: CreateBannerDto): Promise<Banner> {
    return this.bannerRepository.create({
      imageUrl: dto.imageUrl,
      titleEn: dto.titleEn,
      titleAr: dto.titleAr,
      linkUrl: dto.linkUrl,
      sortOrder: dto.sortOrder ?? 0,
      isActive: dto.isActive ?? true,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
    });
  }

  async update(id: string, dto: UpdateBannerDto): Promise<Banner> {
    await this.getOrThrow(id);
    const updated = await this.bannerRepository.update(id, {
      ...dto,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
    });
    return updated as Banner;
  }

  findById(id: string): Promise<NullableType<Banner>> {
    return this.bannerRepository.findById(id);
  }

  list(
    page: number,
    limit: number,
  ): Promise<{ data: Banner[]; total: number }> {
    return this.bannerRepository.findAll(page, limit);
  }

  findActive(): Promise<Banner[]> {
    return this.bannerRepository.findActive();
  }

  async delete(id: string): Promise<void> {
    await this.getOrThrow(id);
    await this.bannerRepository.remove(id);
  }

  private getOrThrow(id: string): Promise<Banner> {
    return findOrThrow(
      this.bannerRepository.findById(id),
      ERROR_CODES.BANNER_NOT_FOUND,
      'Banner not found',
    );
  }
}
