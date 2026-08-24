import { Body, Controller, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/types/authenticated-user.type';
import { MessageResponseDto } from '../common/dto/message-response.dto';
import { MESSAGES } from '../common/constants/messages.constant';
import { UsersService } from '../users/users.service';
import { UpdateNotificationSettingsDto } from './dto/update-notification-settings.dto';

@ApiTags('Notifications')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('me/settings')
export class NotificationSettingsController {
  constructor(private readonly usersService: UsersService) {}

  // System events always create the in-app record regardless of this
  // toggle; this only gates whether a push is attempted (see
  // NotificationsService.dispatchPush).
  @ApiOkResponse({ type: MessageResponseDto })
  @Patch('notifications')
  async update(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: UpdateNotificationSettingsDto,
  ): Promise<MessageResponseDto> {
    await this.usersService.setNotificationsEnabled(
      currentUser.userId,
      dto.enabled,
    );
    return {
      success: true,
      message: MESSAGES.NOTIFICATION.SETTINGS_UPDATED.en,
      messageAr: MESSAGES.NOTIFICATION.SETTINGS_UPDATED.ar,
    };
  }
}
