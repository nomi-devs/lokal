import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/types/authenticated-user.type';
import { MessageResponseDto } from '../common/dto/message-response.dto';
import { MobileAuthService } from './mobile-auth.service';
import { SessionService } from './session.service';
import { SendMobileOtpDto } from './dto/send-mobile-otp.dto';
import { VerifyMobileOtpDto } from './dto/verify-mobile-otp.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LogoutDto } from './dto/logout.dto';
import {
  MeResponseDto,
  MobileAuthResponseDto,
  RefreshTokenResponseDto,
  SendOtpResponseDto,
} from './dto/auth-response.dto';

// Pure OTP auth for the mobile app (customer only) — no password
// anywhere. See DashboardAuthController for the vendor/admin password-based
// equivalent at /dashboard/auth.
@ApiTags('Auth - Mobile')
@Controller('mobile/auth')
export class MobileAuthController {
  constructor(
    private readonly mobileAuthService: MobileAuthService,
    private readonly sessionService: SessionService,
  ) {}

  @ApiOkResponse({ type: SendOtpResponseDto })
  @Throttle({ default: { limit: 5, ttl: 60 * 60 * 1000 } })
  @Post('send-otp')
  sendOtp(@Body() dto: SendMobileOtpDto): Promise<SendOtpResponseDto> {
    return this.mobileAuthService.sendOtp(dto);
  }

  // Creates the account on first use, logs in on every use after — see
  // MobileAuthResponseDto.isNewUser to tell the two apart client-side.
  @ApiOkResponse({ type: MobileAuthResponseDto })
  @Throttle({ default: { limit: 10, ttl: 15 * 60 * 1000 } })
  @Post('verify-otp')
  verifyOtp(
    @Body() dto: VerifyMobileOtpDto,
    @Req() request: Request,
  ): Promise<MobileAuthResponseDto> {
    return this.mobileAuthService.verifyOtp(dto, request);
  }

  @ApiOkResponse({ type: RefreshTokenResponseDto })
  @Post('refresh-token')
  refreshToken(@Body() dto: RefreshTokenDto): Promise<RefreshTokenResponseDto> {
    return this.sessionService.refreshToken(dto);
  }

  @ApiBearerAuth('JWT-auth')
  @ApiOkResponse({ type: MessageResponseDto })
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: LogoutDto,
  ): Promise<MessageResponseDto> {
    return this.sessionService.logout(user.userId, dto);
  }

  @ApiBearerAuth('JWT-auth')
  @ApiOkResponse({ type: MeResponseDto })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: AuthenticatedUser): Promise<MeResponseDto> {
    return this.sessionService.me(user.userId);
  }
}
