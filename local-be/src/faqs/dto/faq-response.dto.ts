import { ApiProperty } from '@nestjs/swagger';
import { Faq } from '../domain/faq';

export class FaqResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: Faq })
  faq: Faq;
}

class PaginationDto {
  @ApiProperty() page: number;
  @ApiProperty() limit: number;
  @ApiProperty() total: number;
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
