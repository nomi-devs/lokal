import { ApiProperty } from '@nestjs/swagger';
import { Category } from '../domain/category';

export class CategoryResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: Category })
  category: Category;
}

class PaginationDto {
  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  total: number;
}

export class CategoriesListResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: [Category] })
  data: Category[];

  @ApiProperty({ type: PaginationDto })
  pagination: PaginationDto;
}
