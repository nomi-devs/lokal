import { ApiProperty } from '@nestjs/swagger';
import { Address } from '../domain/address';

export class AddressResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: Address })
  address: Address;
}

class PaginationDto {
  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  total: number;
}

export class AddressesListResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: [Address] })
  data: Address[];

  @ApiProperty({ type: PaginationDto })
  pagination: PaginationDto;
}
