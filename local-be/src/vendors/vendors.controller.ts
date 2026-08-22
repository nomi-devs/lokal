import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/types/authenticated-user.type';
import { AppException } from '../common/exceptions/app.exception';
import { ERROR_CODES } from '../common/exceptions/error-codes';
import { VendorsService } from './vendors.service';
import { RegisterVendorDto } from './dto/register-vendor.dto';
import { UpdateVendorProfileDto } from './dto/update-vendor-profile.dto';
import {
  RegisterVendorResponseDto,
  VendorResponseDto,
} from './dto/vendor-response.dto';

@ApiTags('Vendors')
@Controller('vendors')
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @ApiCreatedResponse({ type: RegisterVendorResponseDto })
  @Post('register')
  async register(
    @Body() dto: RegisterVendorDto,
  ): Promise<RegisterVendorResponseDto> {
    const vendor = await this.vendorsService.register(dto);
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
