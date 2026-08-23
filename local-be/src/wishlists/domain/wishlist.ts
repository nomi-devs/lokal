import { ApiProperty } from '@nestjs/swagger';

export class Wishlist {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  userId: string;

  @ApiProperty({ type: String })
  productId: string;

  // Named to match the ERD's WISHLISTS.addedAt rather than createdAt —
  // mapped from the schema's timestamps createdAt (see WishlistMapper).
  @ApiProperty()
  addedAt: Date;
}
