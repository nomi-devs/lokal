import { ApiProperty } from '@nestjs/swagger';
import { PlatformCommission } from '../domain/platform-commission';

export class CommissionResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: PlatformCommission })
  commission: PlatformCommission;
}
