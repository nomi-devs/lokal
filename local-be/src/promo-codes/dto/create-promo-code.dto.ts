import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';

export class CreatePromoCodeDto {
  @IsString()
  @Length(3, 20)
  code: string;

  @IsIn(['percentage', 'fixed'])
  discountType: 'percentage' | 'fixed';

  @IsNumber()
  @Min(0.01)
  discountValue: number;

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

  @IsDateString()
  validFrom: string;

  @IsDateString()
  validUntil: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
