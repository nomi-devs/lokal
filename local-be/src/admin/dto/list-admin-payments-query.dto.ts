import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class ListAdminPaymentsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  vendorId?: string;
}
