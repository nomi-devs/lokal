import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

// Code is immutable after creation — delete and recreate instead of renaming
// (keeps `currentUsageCount`/`lastUsedAt` history meaningful for one code).
export class UpdatePromoCodeDto {
  @IsOptional()
  @IsIn(['percentage', 'fixed'])
  discountType?: 'percentage' | 'fixed';

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  discountValue?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxUsageCount?: number;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  applicableVendorIds?: string[];

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  applicableCategoryIds?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrderValue?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDiscountCap?: number;

  @IsOptional()
  @IsDateString()
  validFrom?: string;

  @IsOptional()
  @IsDateString()
  validUntil?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
