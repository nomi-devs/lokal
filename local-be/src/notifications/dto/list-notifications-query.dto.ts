import { IsIn, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

// all = no isRead filter; read/unread narrow to that value (see
// NotificationsService.findManyByUserId / the repository's isRead query).
export class ListNotificationsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsIn(['all', 'read', 'unread'])
  status: 'all' | 'read' | 'unread' = 'all';
}
