import { ApiProperty } from '@nestjs/swagger';
import { PromoCode } from '../domain/promo-code';

export class PromoCodeResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: PromoCode })
  promoCode: PromoCode;
}

class PaginationDto {
  @ApiProperty() page: number;
  @ApiProperty() limit: number;
  @ApiProperty() total: number;
}

export class PromoCodesListResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: [PromoCode] })
  data: PromoCode[];

  @ApiProperty({ type: PaginationDto })
  pagination: PaginationDto;
}
