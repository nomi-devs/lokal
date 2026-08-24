import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/types/authenticated-user.type';
import { RefundsService } from './refunds.service';
import { AdminListRefundsQueryDto } from './dto/admin-list-refunds-query.dto';
import { ModerateRefundDto } from './dto/moderate-refund.dto';
import {
  RefundResponseDto,
  RefundsListResponseDto,
} from './dto/refund-response.dto';

@ApiTags('Admin - Refunds')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/refunds')
export class AdminRefundsController {
  constructor(private readonly refundsService: RefundsService) {}

  @ApiOkResponse({ type: RefundsListResponseDto })
  @Get()
  async list(
    @Query() query: AdminListRefundsQueryDto,
  ): Promise<RefundsListResponseDto> {
    const { data, total } = await this.refundsService.listForAdmin({
      page: query.page,
      limit: query.limit,
      status: query.status,
    });
    return {
      success: true,
      data,
      pagination: { page: query.page, limit: query.limit, total },
    };
  }

  @ApiOkResponse({ type: RefundResponseDto })
  @Get(':id')
  async get(@Param('id') id: string): Promise<RefundResponseDto> {
    const refund = await this.refundsService.getForAdminOrThrow(id);
    return { success: true, refund };
  }

  @ApiOkResponse({ type: RefundResponseDto })
  @Patch(':id/status')
  async moderate(
    @CurrentUser() admin: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: ModerateRefundDto,
  ): Promise<RefundResponseDto> {
    const refund = await this.refundsService.moderate(admin.userId, id, dto);
    return { success: true, refund };
  }
}
