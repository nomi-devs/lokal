import { Injectable } from '@nestjs/common';
import { NullableType } from '../utils/types/nullable.type';
import { AppException } from '../common/exceptions/app.exception';
import { ERROR_CODES } from '../common/exceptions/error-codes';
import type { VendorStatus } from '../common/constants/auth.constants';
import { UsersService } from '../users/users.service';
import { Vendor } from './domain/vendor';
import {
  ListVendorsFilters,
  VendorRepository,
} from './infrastructure/persistence/vendor.repository';
import { RegisterVendorDto } from './dto/register-vendor.dto';
import { UpdateVendorProfileDto } from './dto/update-vendor-profile.dto';

@Injectable()
export class VendorsService {
  constructor(
    private readonly vendorRepository: VendorRepository,
    private readonly usersService: UsersService,
  ) {}

  async register(dto: RegisterVendorDto): Promise<Vendor> {
    const existingStore = await this.vendorRepository.findByStoreName(
      dto.storeName,
    );
    if (existingStore) {
      throw new AppException(
        ERROR_CODES.STORE_NAME_TAKEN,
        'Store name already exists',
        409,
      );
    }

    const user = await this.usersService.createWithPassword({
      phone: dto.phone,
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      password: dto.password,
      role: 'vendor',
    });

    try {
      const vendor = await this.vendorRepository.create({
        userId: user.id,
        storeName: dto.storeName,
        storeDescription: dto.storeDescription,
        city: dto.city,
        country: dto.country,
        address: dto.address,
        phone: dto.phone,
        businessLicense: dto.businessLicense,
        status: 'pending_approval',
        commissionStructure: { defaultPercentage: 15 },
        rating: 0,
        totalReviews: 0,
      });
      await this.usersService.setVendorId(user.id, vendor.id);
      return vendor;
    } catch (error) {
      // Roll back the just-created user so a failed vendor insert doesn't
      // strand an orphaned account (no multi-doc transaction on standalone Mongo).
      await this.usersService.hardDelete(user.id);
      throw error;
    }
  }

  findByUserId(userId: string): Promise<NullableType<Vendor>> {
    return this.vendorRepository.findByUserId(userId);
  }

  findById(id: string): Promise<NullableType<Vendor>> {
    return this.vendorRepository.findById(id);
  }

  findManyByUserIds(userIds: string[]): Promise<Vendor[]> {
    return this.vendorRepository.findManyByUserIds(userIds);
  }

  async updateProfile(
    userId: string,
    dto: UpdateVendorProfileDto,
  ): Promise<Vendor> {
    const vendor = await this.vendorRepository.updateByUserId(userId, dto);
    if (!vendor) {
      throw new AppException(
        ERROR_CODES.VENDOR_NOT_FOUND,
        'Vendor not found',
        404,
      );
    }
    return vendor;
  }

  list(
    filters: ListVendorsFilters,
  ): Promise<{ data: Vendor[]; total: number }> {
    return this.vendorRepository.findManyWithPagination(filters);
  }

  async approve(
    id: string,
    adminId: string,
    approvalNotes?: string,
  ): Promise<Vendor> {
    const vendor = await this.getOrThrow(id);
    const updated = await this.vendorRepository.update(id, {
      status: 'active',
      approvedAt: new Date(),
      approvedBy: adminId,
      approvalNotes,
    });
    return updated ?? vendor;
  }

  async reject(
    id: string,
    rejectionReason: string,
    rejectionCategory: string,
  ): Promise<Vendor> {
    const vendor = await this.getOrThrow(id);
    const updated = await this.vendorRepository.update(id, {
      status: 'inactive',
      rejectionReason,
      rejectionCategory,
    });
    await this.usersService.setStatus(vendor.userId, 'inactive');
    return updated ?? vendor;
  }

  async suspend(
    id: string,
    reason: string,
    duration?: number,
  ): Promise<Vendor> {
    const vendor = await this.getOrThrow(id);
    const updated = await this.vendorRepository.update(id, {
      status: 'suspended',
      suspendReason: reason,
      suspendedUntil: duration
        ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000)
        : undefined,
    });
    await this.usersService.setStatus(vendor.userId, 'suspended');
    return updated ?? vendor;
  }

  countByStatus(status: VendorStatus): Promise<number> {
    return this.vendorRepository.countByStatus(status);
  }

  countCreatedSince(since: Date): Promise<number> {
    return this.vendorRepository.countCreatedSince(since);
  }

  countAll(): Promise<number> {
    return this.vendorRepository.countAll();
  }

  private async getOrThrow(id: string): Promise<Vendor> {
    const vendor = await this.vendorRepository.findById(id);
    if (!vendor) {
      throw new AppException(
        ERROR_CODES.VENDOR_NOT_FOUND,
        'Vendor not found',
        404,
      );
    }
    return vendor;
  }
}
