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
  Length,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { LocalizedTextDto } from './localized-text.dto';

// Admin's general-edit endpoint — same content fields as the vendor's own
// PATCH, plus the ability to flag a product 'rejected' (with a reason) if
// it's inappropriate. There's no separate approve endpoint: products are
// live by default (status: 'active' on create, see ProductsService), so
// "approving" a previously-rejected one is just setting status back to 'active'.
export class AdminUpdateProductDto {
  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsIn(['male', 'female', 'kids', 'unisex'])
  gender?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedTextDto)
  name?: LocalizedTextDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedTextDto)
  description?: LocalizedTextDto;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsUrl({}, { each: true })
  images?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  price?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
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

  @IsOptional()
  @IsIn(['active', 'inactive', 'rejected'])
  status?: string;

  // Required when status is 'rejected'.
  @ValidateIf((o: AdminUpdateProductDto) => o.status === 'rejected')
  @IsString()
  @Length(5, 500)
  rejectionReason?: string;
}
