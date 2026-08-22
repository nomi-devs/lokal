import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/types/authenticated-user.type';
import { MessageResponseDto } from '../common/dto/message-response.dto';
import { AuthService } from './auth.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LogoutDto } from './dto/logout.dto';
import {
  LoginResponseDto,
  MeResponseDto,
  RefreshTokenResponseDto,
  SendOtpResponseDto,
  VerifyOtpResponseDto,
} from './dto/auth-response.dto';

// No class-level @ApiTags() here on purpose: this controller mixes mobile
// (OTP), dashboard (password), and shared (session) endpoints, and each
// needs its own tag so filter-document-by-tags.util.ts can route it to the
// right Swagger UI (/api-docs/mobile vs /api-docs/dashboard) — see
// common/swagger/swagger-tags.constants.ts for which tag goes where.
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiTags('Auth - Mobile')
  @ApiOkResponse({ type: SendOtpResponseDto })
  @Throttle({ default: { limit: 5, ttl: 60 * 60 * 1000 } })
  @Post('send-otp')
  sendOtp(@Body() dto: SendOtpDto): Promise<SendOtpResponseDto> {
    return this.authService.sendOtp(dto);
  }

  @ApiTags('Auth - Mobile')
  @ApiOkResponse({ type: VerifyOtpResponseDto })
  @Throttle({ default: { limit: 10, ttl: 15 * 60 * 1000 } })
  @Post('verify-otp')
  verifyOtp(
    @Body() dto: VerifyOtpDto,
    @Req() request: Request,
  ): Promise<VerifyOtpResponseDto> {
    return this.authService.verifyOtp(dto, request);
  }

  @ApiTags('Auth - Dashboard')
  @ApiOkResponse({ type: LoginResponseDto })
  @Post('login')
  login(
    @Body() dto: LoginDto,
    @Req() request: Request,
  ): Promise<LoginResponseDto> {
    return this.authService.login(dto, request);
  }

  @ApiTags('Auth - Shared')
  @ApiOkResponse({ type: RefreshTokenResponseDto })
  @Post('refresh-token')
  refreshToken(@Body() dto: RefreshTokenDto): Promise<RefreshTokenResponseDto> {
    return this.authService.refreshToken(dto);
  }

  @ApiTags('Auth - Shared')
  @ApiBearerAuth('JWT-auth')
  @ApiOkResponse({ type: MessageResponseDto })
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: LogoutDto,
  ): Promise<MessageResponseDto> {
    return this.authService.logout(user.userId, dto);
  }

  @ApiTags('Auth - Shared')
  @ApiBearerAuth('JWT-auth')
  @ApiOkResponse({ type: MeResponseDto })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: AuthenticatedUser): Promise<MeResponseDto> {
    return this.authService.me(user.userId);
  }
}
