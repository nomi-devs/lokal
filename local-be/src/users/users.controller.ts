import {
  Body,
  Controller,
  Delete,
  Param,
  Put,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/types/authenticated-user.type';
import { AppException } from '../common/exceptions/app.exception';
import { ERROR_CODES } from '../common/exceptions/error-codes';
import { MessageResponseDto } from '../common/dto/message-response.dto';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { RegisterFcmTokenDto } from './dto/register-fcm-token.dto';
import { DeleteAccountDto } from './dto/delete-account.dto';
import { UpdateProfileResponseDto } from './dto/user-response.dto';
import { MESSAGES } from '../common/constants/messages.constant';

// Mobile self-service — profile edit, push-token registration, account
// deletion. See AccountSecurityController for change-password, split out
// because it's a dashboard-only route (only vendor/admin accounts ever
// have a password) that would otherwise be stuck on this class's
// mobile-only Swagger tag.
@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOkResponse({ type: UpdateProfileResponseDto })
  @Put('update-profile')
  async updateProfile(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: UpdateProfileDto,
  ): Promise<UpdateProfileResponseDto> {
    const user = await this.usersService.updateProfile(currentUser.userId, dto);
    return {
      success: true,
      message: MESSAGES.USER.PROFILE_UPDATED.en,
      messageAr: MESSAGES.USER.PROFILE_UPDATED.ar,
      user,
    };
  }

  @ApiOkResponse({ type: MessageResponseDto })
  @Post('register-fcm-token')
  async registerFcmToken(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: RegisterFcmTokenDto,
  ): Promise<MessageResponseDto> {
    await this.usersService.registerFcmToken(currentUser.userId, dto);
    return {
      success: true,
      message: MESSAGES.USER.FCM_REGISTERED.en,
      messageAr: MESSAGES.USER.FCM_REGISTERED.ar,
    };
  }

  @ApiOkResponse({ type: MessageResponseDto })
  @Delete('fcm-token/:tokenId')
  async removeFcmToken(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('tokenId') tokenId: string,
  ): Promise<MessageResponseDto> {
    await this.usersService.removeFcmTokenById(currentUser.userId, tokenId);
    return {
      success: true,
      message: MESSAGES.USER.FCM_REMOVED.en,
      messageAr: MESSAGES.USER.FCM_REMOVED.ar,
    };
  }

  @ApiOkResponse({ type: MessageResponseDto })
  @Delete('delete-account')
  async deleteAccount(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: DeleteAccountDto,
  ): Promise<MessageResponseDto> {
    const user = await this.usersService.findById(currentUser.userId);
    if (!user) {
      throw new AppException(ERROR_CODES.USER_NOT_FOUND, 'User not found', 404);
    }
    if (user.passwordHash) {
      if (
        !dto.password ||
        !(await this.usersService.verifyPassword(user, dto.password))
      ) {
        throw new AppException(
          ERROR_CODES.UNAUTHORIZED,
          'Invalid credentials',
          401,
        );
      }
    }
    await this.usersService.softDelete(currentUser.userId);
    return {
      success: true,
      message: MESSAGES.USER.ACCOUNT_DELETED.en,
      messageAr: MESSAGES.USER.ACCOUNT_DELETED.ar,
    };
  }
}
