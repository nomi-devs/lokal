import { IsIn, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { REFUND_STATUSES } from '../refunds.constants';

export class AdminListRefundsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsIn(REFUND_STATUSES)
  status?: string;
}
