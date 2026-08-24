import {
  Body,
  Controller,
  Get,
  Param,
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
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { RefundsService } from './refunds.service';
import { CreateRefundDto } from './dto/create-refund.dto';
import {
  RefundResponseDto,
  RefundsListResponseDto,
} from './dto/refund-response.dto';

// Customer self-service — request a refund on a delivered order and track
// your own requests. See AdminRefundsController for the moderation queue.
@ApiTags('Refunds')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('customer')
@Controller('me/refunds')
export class RefundsController {
  constructor(private readonly refundsService: RefundsService) {}

  @ApiOkResponse({ type: RefundsListResponseDto })
  @Get()
  async list(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Query() query: PaginationQueryDto,
  ): Promise<RefundsListResponseDto> {
    const { data, total } = await this.refundsService.listMine(
      currentUser.userId,
      query.page,
      query.limit,
    );
    return {
      success: true,
      data,
      pagination: { page: query.page, limit: query.limit, total },
    };
  }

  @ApiOkResponse({ type: RefundResponseDto })
  @Get(':id')
  async get(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<RefundResponseDto> {
    const refund = await this.refundsService.getMineOrThrow(
      currentUser.userId,
      id,
    );
    return { success: true, refund };
  }

  @ApiCreatedResponse({ type: RefundResponseDto })
  @Post()
  async submit(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: CreateRefundDto,
  ): Promise<RefundResponseDto> {
    const created = await this.refundsService.submit(currentUser.userId, dto);
    const refund = await this.refundsService.getMineOrThrow(
      currentUser.userId,
      created.id,
    );
    return { success: true, refund };
  }
}
