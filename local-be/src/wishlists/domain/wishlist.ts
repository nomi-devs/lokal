import { ApiProperty } from '@nestjs/swagger';

export class Wishlist {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  userId: string;

  @ApiProperty({ type: String })
  productId: string;

  @ApiProperty()
  createdAt: Date;
}
