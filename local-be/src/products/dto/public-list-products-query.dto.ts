import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class PublicListProductsQueryDto {
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

  @IsOptional()
  @IsString()
  categoryId?: string;

  // Scopes results to one store's products — used by the Store Details
  // screen (see VendorsController.findOne for the store profile itself).
  @IsOptional()
  @IsString()
  vendorId?: string;

  @IsOptional()
  @IsIn(['male', 'female', 'kids', 'unisex'])
  gender?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(['newest', 'price_asc', 'price_desc', 'rating', 'popular'])
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'rating' | 'popular';
}
