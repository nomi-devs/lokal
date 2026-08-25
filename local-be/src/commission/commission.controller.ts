import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/types/authenticated-user.type';
import { CommissionService } from './commission.service';
import { UpdateCommissionDto } from './dto/update-commission.dto';
import { CommissionResponseDto } from './dto/commission-response.dto';

// The one platform-wide commission rate, applied to every vendor's order
// at checkout (see OrdersService.buildOrderDrafts). Readable by both
// dashboards — a vendor needs to see their own cut on VendorStore, an
// admin needs to see and change the rate everyone is on — but only an
// admin can change it.
@ApiTags('Commission')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('commission')
export class CommissionController {
  constructor(private readonly commissionService: CommissionService) {}

  @Roles('admin', 'vendor')
  @ApiOkResponse({ type: CommissionResponseDto })
  @Get()
  async get(): Promise<CommissionResponseDto> {
    const commission = await this.commissionService.getOrDefault();
    return { success: true, commission };
  }

  @Roles('admin')
  @ApiOkResponse({ type: CommissionResponseDto })
  @Patch()
  async update(
    @Body() dto: UpdateCommissionDto,
    @CurrentUser() admin: AuthenticatedUser,
  ): Promise<CommissionResponseDto> {
    const commission = await this.commissionService.update(
      dto.percentage,
      admin.userId,
    );
    return { success: true, commission };
  }
}
