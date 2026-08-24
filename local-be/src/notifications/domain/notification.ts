import { ApiProperty } from '@nestjs/swagger';
import type { NotificationType, PushStatus } from '../notifications.constants';

export class Notification {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  userId: string;

  @ApiProperty({
    enum: ['order_update', 'promotion', 'new_order', 'admin_message'],
  })
  type: NotificationType;

  @ApiProperty({ type: String })
  title: string;

  @ApiProperty({ type: String, nullable: true })
  titleAr?: string;

  @ApiProperty({ type: String })
  body: string;

  @ApiProperty({ type: String, nullable: true })
  bodyAr?: string;

  // Free-form extra data attached to the event, e.g. { orderId }.
  @ApiProperty({ type: Object, nullable: true })
  data?: Record<string, unknown> | null;

  @ApiProperty()
  isRead: boolean;

  @ApiProperty({ type: Date, nullable: true })
  readAt?: Date;

  @ApiProperty({ enum: ['sent', 'failed', 'skipped'], nullable: true })
  pushStatus?: PushStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
