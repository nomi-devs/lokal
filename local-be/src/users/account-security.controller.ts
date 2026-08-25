import { Body, Controller, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/types/authenticated-user.type';
import { MessageResponseDto } from '../common/dto/message-response.dto';
import { UsersService } from './users.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { MESSAGES } from '../common/constants/messages.constant';

// Split out of UsersController (mobile self-service — see its header
// comment) because this route is the opposite: only vendor/admin accounts
// ever have a passwordHash (MobileAuthController is pure OTP, no password,
// ever — see verifyPassword's early-return for an unset hash), so this is
// really the dashboard's Settings -> Security tab calling in, not a mobile
// feature. A shared class-level @ApiTags() would put it on whichever
// Swagger doc UsersController is on; splitting it lets this carry its own
// tag onto the dashboard doc instead — same precedent as
// StoresController/VendorsController sharing a URL prefix but different tags.
@ApiTags('Account')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class AccountSecurityController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOkResponse({ type: MessageResponseDto })
  @Put('change-password')
  async changePassword(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: ChangePasswordDto,
  ): Promise<MessageResponseDto> {
    await this.usersService.changePassword(
      currentUser.userId,
      dto.currentPassword,
      dto.newPassword,
    );
    return {
      success: true,
      message: MESSAGES.USER.PASSWORD_CHANGED.en,
      messageAr: MESSAGES.USER.PASSWORD_CHANGED.ar,
    };
  }
}
