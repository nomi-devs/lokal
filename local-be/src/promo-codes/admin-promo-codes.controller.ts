import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
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
import { MessageResponseDto } from '../common/dto/message-response.dto';
import { AppException } from '../common/exceptions/app.exception';
import { ERROR_CODES } from '../common/exceptions/error-codes';
import { PromoCodesService } from './promo-codes.service';
import { CreatePromoCodeDto } from './dto/create-promo-code.dto';
import { UpdatePromoCodeDto } from './dto/update-promo-code.dto';
import { ListAdminPromoCodesQueryDto } from './dto/list-admin-promo-codes-query.dto';
import {
  PromoCodeResponseDto,
  PromoCodesListResponseDto,
} from './dto/promo-code-response.dto';

// Admin-only marketing tool — not part of the mobile-app checkout flow yet
// (POST /orders doesn't accept a promo code), so this is pure CRUD/tracking
// for now rather than something that actually discounts a real order.
@ApiTags('Admin - Promo Codes')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/promo-codes')
export class AdminPromoCodesController {
  constructor(private readonly promoCodesService: PromoCodesService) {}

  @ApiOkResponse({ type: PromoCodesListResponseDto })
  @Get()
  async list(
    @Query() query: ListAdminPromoCodesQueryDto,
  ): Promise<PromoCodesListResponseDto> {
    const { data, total } = await this.promoCodesService.list(query);
    return {
      success: true,
      data,
      pagination: { page: query.page, limit: query.limit, total },
    };
  }

  @ApiOkResponse({ type: PromoCodeResponseDto })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<PromoCodeResponseDto> {
    const promoCode = await this.promoCodesService.findById(id);
    if (!promoCode) {
      throw new AppException(
        ERROR_CODES.PROMO_CODE_NOT_FOUND,
        'Promo code not found',
        404,
      );
    }
    return { success: true, promoCode };
  }

  @ApiCreatedResponse({ type: PromoCodeResponseDto })
  @Post()
  async create(
    @CurrentUser() admin: AuthenticatedUser,
    @Body() dto: CreatePromoCodeDto,
  ): Promise<PromoCodeResponseDto> {
    const promoCode = await this.promoCodesService.create(admin.userId, dto);
    return { success: true, promoCode };
  }

  @ApiOkResponse({ type: PromoCodeResponseDto })
  @Patch(':id')
  async update(
    @CurrentUser() admin: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdatePromoCodeDto,
  ): Promise<PromoCodeResponseDto> {
    const promoCode = await this.promoCodesService.update(
      admin.userId,
      id,
      dto,
    );
    return { success: true, promoCode };
  }

  @ApiOkResponse({ type: MessageResponseDto })
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<MessageResponseDto> {
    await this.promoCodesService.remove(id);
    return {
      success: true,
      message: 'Promo code deleted',
      messageAr: 'تم حذف كود الخصم',
    };
  }
}
