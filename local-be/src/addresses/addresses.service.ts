import { Injectable } from '@nestjs/common';
import { Address } from './domain/address';
import { AddressRepository } from './infrastructure/persistence/address.repository';

@Injectable()
export class AddressesService {
  constructor(private readonly addressRepository: AddressRepository) {}

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
}
