import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/types/authenticated-user.type';
import { MessageResponseDto } from '../common/dto/message-response.dto';
import { MESSAGES } from '../common/constants/messages.constant';
import { NotificationsService } from './notifications.service';
import {
  NotificationListResponseDto,
  UnreadCountResponseDto,
} from './dto/notification-response.dto';
import { ListNotificationsQueryDto } from './dto/list-notifications-query.dto';

// Shared by customers, vendors, and admins alike — order updates and
// promotions for customers, new-order alerts and admin messages for vendors
// — so this controller carries no @Roles() restriction, just an
// authenticated user.
@ApiTags('Notifications')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('me/notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @ApiOkResponse({ type: NotificationListResponseDto })
  @Get()
  async list(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Query() query: ListNotificationsQueryDto,
  ): Promise<NotificationListResponseDto> {
    const { data, unreadCount, total } =
      await this.notificationsService.findManyByUserId(
        currentUser.userId,
        query.page,
        query.limit,
        query.status,
      );
    return {
      success: true,
      data,
      unreadCount,
      pagination: { page: query.page, limit: query.limit, total },
    };
  }

  @ApiOkResponse({ type: UnreadCountResponseDto })
  @Get('unread-count')
  async unreadCount(
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<UnreadCountResponseDto> {
    const unreadCount = await this.notificationsService.countUnreadByUserId(
      currentUser.userId,
    );
    return { success: true, unreadCount };
  }

  @ApiOkResponse({ type: MessageResponseDto })
  @Patch(':id/read')
  async markRead(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<MessageResponseDto> {
    await this.notificationsService.markRead(currentUser.userId, id);
    return {
      success: true,
      message: MESSAGES.NOTIFICATION.MARKED_READ.en,
      messageAr: MESSAGES.NOTIFICATION.MARKED_READ.ar,
    };
  }

  @ApiOkResponse({ type: MessageResponseDto })
  @Patch('read-all')
  async markAllRead(
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<MessageResponseDto> {
    await this.notificationsService.markAllRead(currentUser.userId);
    return {
      success: true,
      message: MESSAGES.NOTIFICATION.ALL_MARKED_READ.en,
      messageAr: MESSAGES.NOTIFICATION.ALL_MARKED_READ.ar,
    };
  }
}
