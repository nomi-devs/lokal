import { ApiProperty } from '@nestjs/swagger';

class NotificationItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty({
    enum: ['order_update', 'promotion', 'new_order', 'admin_message'],
  })
  type: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ nullable: true })
  titleAr: string | null;

  @ApiProperty()
  body: string;

  @ApiProperty({ nullable: true })
  bodyAr: string | null;

  @ApiProperty({ type: Object, nullable: true })
  data: Record<string, unknown> | null;

  @ApiProperty()
  isRead: boolean;

  @ApiProperty()
  createdAt: string;
}

class PaginationDto {
  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  total: number;
}

export class NotificationListResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: [NotificationItemDto] })
  data: NotificationItemDto[];

  @ApiProperty()
  unreadCount: number;

  @ApiProperty({ type: PaginationDto })
  pagination: PaginationDto;
}

export class UnreadCountResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty()
  unreadCount: number;
}
