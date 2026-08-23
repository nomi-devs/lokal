import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/types/authenticated-user.type';
import { AppException } from '../common/exceptions/app.exception';
import { ERROR_CODES } from '../common/exceptions/error-codes';
import { VendorsService } from './vendors.service';
import { RegisterVendorDto } from './dto/register-vendor.dto';
import { VerifyVendorRegistrationDto } from './dto/verify-vendor-registration.dto';
import { ResendVendorOtpDto } from './dto/resend-vendor-otp.dto';
import { UpdateVendorProfileDto } from './dto/update-vendor-profile.dto';
import { KycUploadUrlDto } from './dto/kyc-upload-url.dto';
import {
  KycUploadUrlResponseDto,
  RegisterVendorResponseDto,
  VendorResponseDto,
} from './dto/vendor-response.dto';
import { SendOtpResponseDto } from '../auth/dto/auth-response.dto';
import { FilesS3PresignedService } from '../files/infrastructure/uploader/s3-presigned/files.service';

@ApiTags('Vendors')
@Controller('vendors')
export class VendorsController {
  constructor(
    private readonly vendorsService: VendorsService,
    private readonly filesService: FilesS3PresignedService,
  ) {}

  // Public: there's no account yet at this point in the registration flow,
  // so this can't go through the authenticated /files/upload-url endpoint.
  // No FileRecord is persisted — the resulting URL is stored directly on
  // the vendor via kycDocumentUrl below (see FilesS3PresignedService.createPublicUploadUrl).
  @ApiCreatedResponse({ type: KycUploadUrlResponseDto })
  @Post('kyc-upload-url')
  async kycUploadUrl(
    @Body() dto: KycUploadUrlDto,
  ): Promise<KycUploadUrlResponseDto> {
    const result = await this.filesService.createPublicUploadUrl(
      dto.fileName,
      dto.contentType,
      'vendor-kyc',
    );
    return { success: true, ...result };
  }

  // Public: step 1 of registration — sends an OTP to the given email, no
  // account created yet. See verifyRegistration below for step 2.
  @ApiOkResponse({ type: SendOtpResponseDto })
  @Throttle({ default: { limit: 5, ttl: 60 * 60 * 1000 } })
  @Post('register')
  async register(@Body() dto: RegisterVendorDto): Promise<SendOtpResponseDto> {
    return this.vendorsService.register(dto);
  }

  // Public: re-sends the OTP for an in-progress registration.
  @ApiOkResponse({ type: SendOtpResponseDto })
  @Throttle({ default: { limit: 5, ttl: 60 * 60 * 1000 } })
  @Post('resend-otp')
  async resendOtp(
    @Body() dto: ResendVendorOtpDto,
  ): Promise<SendOtpResponseDto> {
    return this.vendorsService.resendOtp(dto);
  }

  // Public: step 2 of registration — verifies the OTP from register() and
  // creates the account (mirrors MobileAuthController's verify-registration).
  @ApiCreatedResponse({ type: RegisterVendorResponseDto })
  @Throttle({ default: { limit: 10, ttl: 15 * 60 * 1000 } })
  @Post('verify-registration')
  async verifyRegistration(
    @Body() dto: VerifyVendorRegistrationDto,
  ): Promise<RegisterVendorResponseDto> {
    const vendor = await this.vendorsService.verifyRegistration(dto);
    return {
      success: true,
      message: 'Vendor registration successful',
      vendor: {
        id: vendor.id,
        userId: vendor.userId,
        storeName: vendor.storeName,
        status: vendor.status,
        message:
          'Your account is pending admin approval. You will receive a notification once approved.',
      },
    };
  }

  @ApiBearerAuth('JWT-auth')
  @ApiOkResponse({ type: VendorResponseDto })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('vendor')
  @Get('me')
  async me(
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<VendorResponseDto> {
    const vendor = await this.vendorsService.findByUserId(currentUser.userId);
    if (!vendor) {
      throw new AppException(
        ERROR_CODES.VENDOR_NOT_FOUND,
        'Vendor not found',
        404,
      );
    }
    return { success: true, vendor };
  }

  @ApiBearerAuth('JWT-auth')
  @ApiOkResponse({ type: VendorResponseDto })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('vendor')
  @Put('update-profile')
  async updateProfile(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: UpdateVendorProfileDto,
  ): Promise<VendorResponseDto> {
    const vendor = await this.vendorsService.updateProfile(
      currentUser.userId,
      dto,
    );
    return { success: true, vendor };
  }
}
