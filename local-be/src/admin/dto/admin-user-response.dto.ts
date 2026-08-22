import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/domain/user';
import { Vendor } from '../../vendors/domain/vendor';

export class AdminUserListItemDto extends User {
  @ApiProperty({ type: Vendor, nullable: true })
  vendor: Vendor | null;
}

class PaginationDto {
  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  total: number;
}

export class AdminUsersListResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: [AdminUserListItemDto] })
  data: AdminUserListItemDto[];

  @ApiProperty({ type: PaginationDto })
  pagination: PaginationDto;
}

export class AdminUserDetailResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: User })
  user: User;
}

class UserStatusSummaryDto {
  @ApiProperty({ enum: ['active', 'inactive', 'suspended'] })
  status: string;
}

export class AdminUpdateUserStatusResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: UserStatusSummaryDto })
  user: UserStatusSummaryDto;
}
