import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { LocalizedTextDto } from '../../products/dto/localized-text.dto';

// See ReviewsService.submit — orderId/productId together prove this is a
// real, delivered purchase (and dedupe one review per order/product).
export class CreateReviewDto {
  @IsString()
  orderId: string;

  @IsString()
  productId: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ValidateNested()
  @Type(() => LocalizedTextDto)
  title: LocalizedTextDto;

  @ValidateNested()
  @Type(() => LocalizedTextDto)
  comment: LocalizedTextDto;

  // Pre-uploaded via POST /files/upload-url, same convention as
  // CreateProductDto.images.
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(6)
  @IsUrl({}, { each: true })
  images?: string[];
}
