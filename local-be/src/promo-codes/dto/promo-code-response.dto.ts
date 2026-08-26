import { ApiProperty } from '@nestjs/swagger';
import { PromoCode } from '../domain/promo-code';
import { PaginationDto } from '../../common/dto/pagination-response.dto';

export class PromoCodeResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: PromoCode })
  promoCode: PromoCode;
}

export class PromoCodesListResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: [PromoCode] })
  data: PromoCode[];

  @ApiProperty({ type: PaginationDto })
  pagination: PaginationDto;
}
