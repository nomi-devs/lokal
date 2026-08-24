import { IsIn, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

// Active = not delivered/cancelled; Previous = delivered; Canceled =
// cancelled (see OrdersService.TAB_STATUSES for the enum mapping).
export class ListCustomerOrdersQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsIn(['active', 'previous', 'canceled'])
  tab?: 'active' | 'previous' | 'canceled';
}
