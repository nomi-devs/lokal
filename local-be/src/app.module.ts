import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { VendorsModule } from './vendors/vendors.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { OtpModule } from './otp/otp.module';
import { SmsModule } from './sms/sms.module';
import { RefreshTokensModule } from './refresh-tokens/refresh-tokens.module';
import { FilesModule } from './files/files.module';
import { AdminModule } from './admin/admin.module';
import { AddressesModule } from './addresses/addresses.module';
import { WishlistsModule } from './wishlists/wishlists.module';
import { CartModule } from './cart/cart.module';
import { PaymentsModule } from './payments/payments.module';
import { OrdersModule } from './orders/orders.module';
import { FaqsModule } from './faqs/faqs.module';
import { BannersModule } from './banners/banners.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PushModule } from './push/push.module';
import { ReviewsModule } from './reviews/reviews.module';
import { PromoCodesModule } from './promo-codes/promo-codes.module';
import { RefundsModule } from './refunds/refunds.module';
import { SettingsModule } from './settings/settings.module';
import { CommissionModule } from './commission/commission.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppExceptionFilter } from './common/filters/app-exception.filter';
import appConfig from './config/app.config';
import databaseConfig from './database/config/database.config';
import authConfig from './auth/config/auth.config';
import smsConfig from './sms/config/sms.config';
import emailConfig from './email/config/email.config';
import fileConfig from './files/config/file.config';
import cartConfig from './cart/config/cart.config';
import myfatoorahConfig from './payments/config/myfatoorah.config';
import pushConfig from './push/config/push.config';
import { AllConfigType } from './config/config.type';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfig,
        databaseConfig,
        authConfig,
        smsConfig,
        emailConfig,
        fileConfig,
        cartConfig,
        myfatoorahConfig,
        pushConfig,
      ],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AllConfigType>) => ({
        uri: configService.getOrThrow('database.uri', { infer: true }),
      }),
    }),
    ThrottlerModule.forRoot([{ ttl: 15 * 60 * 1000, limit: 100 }]),
    AuthModule,
    UsersModule,
    VendorsModule,
    CategoriesModule,
    ProductsModule,
    OtpModule,
    SmsModule,
    RefreshTokensModule,
    FilesModule,
    AdminModule,
    AddressesModule,
    WishlistsModule,
    CartModule,
    PaymentsModule,
    OrdersModule,
    FaqsModule,
    BannersModule,
    PushModule,
    NotificationsModule,
    ReviewsModule,
    PromoCodesModule,
    RefundsModule,
    SettingsModule,
    CommissionModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_FILTER, useClass: AppExceptionFilter },
  ],
})
export class AppModule {}
