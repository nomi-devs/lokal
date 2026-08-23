import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

// Reusable page/limit query shape for simple nested-resource listings (a
// vendor's products, a user's wishlist/addresses) that don't need extra
// filters — ListVendorsQueryDto/ListUsersQueryDto keep their own since they
// add status/search on top of the same page/limit pair.
export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 20;
}
