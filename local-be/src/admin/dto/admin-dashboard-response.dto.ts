import { ApiProperty } from '@nestjs/swagger';

class RegistrationsDto {
  @ApiProperty()
  today: number;

  @ApiProperty()
  this_week: number;

  @ApiProperty()
  this_month: number;
}

class DashboardStatsDto {
  @ApiProperty()
  totalUsers: number;

  @ApiProperty()
  activeUsers: number;

  @ApiProperty()
  totalVendors: number;

  @ApiProperty()
  pendingApprovals: number;

  @ApiProperty()
  activeVendors: number;

  @ApiProperty()
  suspendedVendors: number;

  @ApiProperty({ type: RegistrationsDto })
  registrations: RegistrationsDto;

  @ApiProperty()
  newVendorApplications: number;
}

export class AdminDashboardStatsResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: DashboardStatsDto })
  stats: DashboardStatsDto;
}
