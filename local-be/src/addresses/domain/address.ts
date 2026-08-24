import { ApiProperty } from '@nestjs/swagger';

export class Address {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  userId: string;

  @ApiProperty({ enum: ['home', 'office', 'other'] })
  label: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  country?: string;

  @ApiProperty()
  city: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  addressLine: string;

  @ApiProperty()
  isPrimary: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
