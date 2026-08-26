import { ApiProperty } from '@nestjs/swagger';
import { Product } from '../domain/product';
import { PaginationDto } from '../../common/dto/pagination-response.dto';

export class ProductResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: Product })
  product: Product;
}

export class ProductsListResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: [Product] })
  data: Product[];

  @ApiProperty({ type: PaginationDto })
  pagination: PaginationDto;
}
