import { ApiProperty } from '@nestjs/swagger';
import { Category } from '../domain/category';
import { PaginationDto } from '../../common/dto/pagination-response.dto';

export class CategoryResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: Category })
  category: Category;
}

export class CategoriesListResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: [Category] })
  data: Category[];

  @ApiProperty({ type: PaginationDto })
  pagination: PaginationDto;
}
