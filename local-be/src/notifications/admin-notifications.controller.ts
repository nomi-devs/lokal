import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { AppException } from '../common/exceptions/app.exception';
import { ERROR_CODES } from '../common/exceptions/error-codes';
import { MessageResponseDto } from '../common/dto/message-response.dto';
import { MESSAGES } from '../common/constants/messages.constant';
import { VendorsService } from '../vendors/vendors.service';
import { NotificationsService } from './notifications.service';
import { SendVendorNotificationDto } from './dto/send-vendor-notification.dto';

@ApiTags('Admin - Notifications')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/notifications')
export class AdminNotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly vendorsService: VendorsService,
  ) {}

  // vendorId omitted -> broadcast to every vendor account.
  @ApiCreatedResponse({ type: MessageResponseDto })
  @Post('vendor')
  async sendToVendor(
    @Body() dto: SendVendorNotificationDto,
  ): Promise<MessageResponseDto> {
    const template = {
      type: 'admin_message' as const,
      title: dto.title,
      titleAr: dto.titleAr,
      body: dto.message,
      bodyAr: dto.messageAr,
    };

    if (dto.vendorId) {
      const vendor = await this.vendorsService.findById(dto.vendorId);
      if (!vendor) {
        throw new AppException(
          ERROR_CODES.VENDOR_NOT_FOUND,
          'Vendor not found',
          404,
        );
      }
      await this.notificationsService.notify(vendor.userId, template);
    } else {
      const userIds = await this.vendorsService.findAllVendorUserIds();
      await this.notificationsService.notifyMany(userIds, template);
    }

    return {
      success: true,
      message: MESSAGES.NOTIFICATION.VENDOR_MESSAGE_SENT.en,
      messageAr: MESSAGES.NOTIFICATION.VENDOR_MESSAGE_SENT.ar,
    };
  }
}
