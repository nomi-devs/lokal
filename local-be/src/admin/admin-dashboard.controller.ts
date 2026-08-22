import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UsersService } from '../users/users.service';
import { VendorsService } from '../vendors/vendors.service';
import { AdminDashboardStatsResponseDto } from './dto/admin-dashboard-response.dto';

function startOfDay(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

@ApiTags('Admin - Dashboard')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/dashboard')
export class AdminDashboardController {
  constructor(
    private readonly usersService: UsersService,
    private readonly vendorsService: VendorsService,
  ) {}

  @ApiOkResponse({ type: AdminDashboardStatsResponseDto })
  @Get('stats')
  async stats(): Promise<AdminDashboardStatsResponseDto> {
    const today = startOfDay();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const epoch = new Date(0);
    const [
      totalUsers,
      activeUsers,
      totalVendors,
      pendingApprovals,
      activeVendors,
      suspendedVendors,
      registeredToday,
      registeredThisWeek,
      registeredThisMonth,
      newVendorApplications,
    ] = await Promise.all([
      this.usersService.countRegisteredSince(epoch),
      this.usersService.countActive(),
      this.vendorsService.countCreatedSince(epoch),
      this.vendorsService.countByStatus('pending_approval'),
      this.vendorsService.countByStatus('active'),
      this.vendorsService.countByStatus('suspended'),
      this.usersService.countRegisteredSince(today),
      this.usersService.countRegisteredSince(weekAgo),
      this.usersService.countRegisteredSince(monthAgo),
      this.vendorsService.countCreatedSince(today),
    ]);

    return {
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        totalVendors,
        pendingApprovals,
        activeVendors,
        suspendedVendors,
        registrations: {
          today: registeredToday,
          this_week: registeredThisWeek,
          this_month: registeredThisMonth,
        },
        newVendorApplications,
      },
    };
  }
}
