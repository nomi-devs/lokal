import { Injectable } from '@nestjs/common';
import { AppException } from '../common/exceptions/app.exception';
import { ERROR_CODES } from '../common/exceptions/error-codes';
import { Address } from './domain/address';
import { AddressRepository } from './infrastructure/persistence/address.repository';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressesService {
  constructor(private readonly addressRepository: AddressRepository) {}

  async createForUser(userId: string, dto: CreateAddressDto): Promise<Address> {
    // A user's first saved address is always primary; otherwise defer to
    // the caller's choice (defaulting to false).
    const existing = await this.addressRepository.countByUserId(userId);
    const isPrimary = existing === 0 ? true : (dto.isPrimary ?? false);

    if (isPrimary) {
      await this.addressRepository.unsetPrimaryForUser(userId);
    }

    return this.addressRepository.create({
      userId,
      label: dto.label ?? 'home',
      name: dto.name,
      country: dto.country,
      city: dto.city,
      phone: dto.phone,
      addressLine: dto.addressLine,
      isPrimary,
    });
  }

  findManyByUserId(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ data: Address[]; total: number }> {
    return this.addressRepository.findManyByUserId(userId, page, limit);
  }

  countByUserId(userId: string): Promise<number> {
    return this.addressRepository.countByUserId(userId);
  }

  async updateForUser(
    userId: string,
    addressId: string,
    dto: UpdateAddressDto,
  ): Promise<Address> {
    await this.getOwnedByUserOrThrow(userId, addressId);

    if (dto.isPrimary) {
      await this.addressRepository.unsetPrimaryForUser(userId, addressId);
    }

    const updated = await this.addressRepository.update(addressId, dto);
    if (!updated) {
      throw new AppException(
        ERROR_CODES.ADDRESS_NOT_FOUND,
        'Address not found',
        404,
      );
    }
    return updated;
  }

  async removeForUser(userId: string, addressId: string): Promise<void> {
    await this.getOwnedByUserOrThrow(userId, addressId);
    await this.addressRepository.remove(addressId);
  }

  async setPrimaryForUser(userId: string, addressId: string): Promise<Address> {
    await this.getOwnedByUserOrThrow(userId, addressId);

    await this.addressRepository.unsetPrimaryForUser(userId, addressId);
    const updated = await this.addressRepository.update(addressId, {
      isPrimary: true,
    });
    if (!updated) {
      throw new AppException(
        ERROR_CODES.ADDRESS_NOT_FOUND,
        'Address not found',
        404,
      );
    }
    return updated;
  }

  // Public: also used by OrdersService to validate+snapshot the checkout
  // address (see OrdersService.checkout).
  async getOwnedByUserOrThrow(
    userId: string,
    addressId: string,
  ): Promise<Address> {
    const address = await this.addressRepository.findById(addressId);
    // 404 (not 403) for cross-user access — avoids leaking whether another
    // user's address exists (same precedent as ProductsService).
    if (!address || address.userId !== userId) {
      throw new AppException(
        ERROR_CODES.ADDRESS_NOT_FOUND,
        'Address not found',
        404,
      );
    }
    return address;
  }
}
