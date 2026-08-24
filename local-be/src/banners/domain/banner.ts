import { ApiProperty } from '@nestjs/swagger';

export class Banner {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty()
  imageUrl: string;

  @ApiProperty({ required: false })
  titleEn?: string;

  @ApiProperty({ required: false })
  titleAr?: string;

  @ApiProperty({ required: false })
  linkUrl?: string;

  @ApiProperty({ default: 0 })
  sortOrder: number;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({ required: false })
  startDate?: Date;

  @ApiProperty({ required: false })
  endDate?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
