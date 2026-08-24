import { IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { REVIEW_STATUSES } from '../reviews.constants';

export class AdminListReviewsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsIn(REVIEW_STATUSES)
  status?: string;

  @IsOptional()
  @IsString()
  productId?: string;

  @IsOptional()
  @IsString()
  vendorId?: string;
}
