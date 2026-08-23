import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { DashboardAuthController } from './dashboard-auth.controller';
import { MobileAuthController } from './mobile-auth.controller';
import { DashboardAuthService } from './dashboard-auth.service';
import { MobileAuthService } from './mobile-auth.service';
import { SessionService } from './session.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';
import { VendorsModule } from '../vendors/vendors.module';
import { OtpModule } from '../otp/otp.module';
import { SmsModule } from '../sms/sms.module';
import { EmailModule } from '../email/email.module';
import { RefreshTokensModule } from '../refresh-tokens/refresh-tokens.module';

@Module({
  imports: [
    UsersModule,
    VendorsModule,
    OtpModule,
    SmsModule,
    EmailModule,
    RefreshTokensModule,
    PassportModule,
    // Access/refresh tokens use different secrets and expiries, both set
    // per-call in SessionService.signAccessToken/signRefreshToken, so no
    // global JwtModule config is needed here beyond registering the provider.
    JwtModule.register({}),
  ],
  controllers: [DashboardAuthController, MobileAuthController],
  providers: [
    DashboardAuthService,
    MobileAuthService,
    SessionService,
    JwtStrategy,
  ],
  exports: [SessionService],
})
export class AuthModule {}
