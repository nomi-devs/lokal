import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  ValidateNested,
} from 'class-validator';
import { LocalizedTextDto } from './localized-text.dto';
import { CompareAtGreaterThanPrice } from './compare-at-greater-than-price.validator';

// vendorId is intentionally excluded — it's implicit from the authenticated
// vendor making the request (see ProductsService.createByVendor). status/
// moderationStatus are also excluded — the service hardcodes them
// (status: 'active', moderationStatus: 'pending') since moderation is
// currently always-on (see ProductsService for the reset-to-pending rule).
export class CreateProductDto {
  // Existence is checked in ProductsService, not here — DTOs only validate
  // shape/format, business rules live in the service (see VendorsService for
  // the same split on storeName/email checks).
  @IsString()
  categoryId: string;

  @IsIn(['male', 'female', 'kids', 'unisex'])
  gender: string;

  @ValidateNested()
  @Type(() => LocalizedTextDto)
  name: LocalizedTextDto;

  @ValidateNested()
  @Type(() => LocalizedTextDto)
  description: LocalizedTextDto;

  @IsArray()
  @ArrayMinSize(1)
  @IsUrl({}, { each: true })
  images: string[];

  @IsNumber()
  @Min(0.01)
  price: number;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  @CompareAtGreaterThanPrice()
  compareAtPrice?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sizes?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  colors?: string[];

  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsBoolean()
  inStock?: boolean;
}
