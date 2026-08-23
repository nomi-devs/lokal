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
import { MobileRegisterDto } from './dto/mobile-register.dto';
import { VerifyRegistrationOtpDto } from './dto/verify-registration-otp.dto';
import { MobileLoginDto } from './dto/mobile-login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LogoutDto } from './dto/logout.dto';
import {
  MeResponseDto,
  MobileAuthResponseDto,
  RefreshTokenResponseDto,
  SendOtpResponseDto,
} from './dto/auth-response.dto';

// Password-based login for customers/drivers. OTP only appears on
// register/verify-registration and forgot-password/reset-password — never on
// login itself. See DashboardAuthController for the vendor/admin equivalent
// at /dashboard/auth.
@ApiTags('Auth - Mobile')
@Controller('mobile/auth')
export class MobileAuthController {
  constructor(
    private readonly mobileAuthService: MobileAuthService,
    private readonly sessionService: SessionService,
  ) {}

  @ApiOkResponse({ type: SendOtpResponseDto })
  @Throttle({ default: { limit: 5, ttl: 60 * 60 * 1000 } })
  @Post('register')
  register(@Body() dto: MobileRegisterDto): Promise<SendOtpResponseDto> {
    return this.mobileAuthService.sendRegistrationOtp(dto);
  }

  @ApiOkResponse({ type: MobileAuthResponseDto })
  @Throttle({ default: { limit: 10, ttl: 15 * 60 * 1000 } })
  @Post('verify-registration')
  verifyRegistration(
    @Body() dto: VerifyRegistrationOtpDto,
    @Req() request: Request,
  ): Promise<MobileAuthResponseDto> {
    return this.mobileAuthService.verifyRegistrationOtp(dto, request);
  }

  @ApiOkResponse({ type: MobileAuthResponseDto })
  @Post('login')
  login(
    @Body() dto: MobileLoginDto,
    @Req() request: Request,
  ): Promise<MobileAuthResponseDto> {
    return this.mobileAuthService.login(dto, request);
  }

  @ApiOkResponse({ type: SendOtpResponseDto })
  @Throttle({ default: { limit: 5, ttl: 60 * 60 * 1000 } })
  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto): Promise<SendOtpResponseDto> {
    return this.mobileAuthService.forgotPassword(dto);
  }

  @ApiOkResponse({ type: MobileAuthResponseDto })
  @Throttle({ default: { limit: 10, ttl: 15 * 60 * 1000 } })
  @Post('reset-password')
  resetPassword(
    @Body() dto: ResetPasswordDto,
    @Req() request: Request,
  ): Promise<MobileAuthResponseDto> {
    return this.mobileAuthService.resetPassword(dto, request);
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
