import { ApiProperty } from '@nestjs/swagger';
import { Faq } from '../domain/faq';
import { PaginationDto } from '../../common/dto/pagination-response.dto';

export class FaqResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: Faq })
  faq: Faq;
}

export class FaqsListResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: [Faq] })
  data: Faq[];

  @ApiProperty({ type: PaginationDto })
  pagination: PaginationDto;
}

export class ActiveFaqsResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: [Faq] })
  data: Faq[];
}
