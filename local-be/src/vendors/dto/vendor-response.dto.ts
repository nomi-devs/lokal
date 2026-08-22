import { ApiProperty } from '@nestjs/swagger';
import { Vendor } from '../domain/vendor';

class VendorRegistrationSummaryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  storeName: string;

  @ApiProperty({
    enum: ['pending_approval', 'active', 'suspended', 'inactive'],
  })
  status: string;

  @ApiProperty()
  message: string;
}

export class RegisterVendorResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: VendorRegistrationSummaryDto })
  vendor: VendorRegistrationSummaryDto;
}

export class VendorResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: Vendor })
  vendor: Vendor;
}
