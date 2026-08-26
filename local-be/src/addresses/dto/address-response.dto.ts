import { ApiProperty } from '@nestjs/swagger';
import { Address } from '../domain/address';
import { PaginationDto } from '../../common/dto/pagination-response.dto';

export class AddressResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: Address })
  address: Address;
}

export class AddressesListResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: [Address] })
  data: Address[];

  @ApiProperty({ type: PaginationDto })
  pagination: PaginationDto;
}
