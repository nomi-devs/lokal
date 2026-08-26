import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/domain/user';
import { Address } from '../../addresses/domain/address';
import { Product } from '../../products/domain/product';
import { PaginationDto } from '../../common/dto/pagination-response.dto';

class WishlistItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  productId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ type: Product, nullable: true })
  product: Product | null;
}

export class AdminUserWishlistListResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: [WishlistItemDto] })
  data: WishlistItemDto[];

  @ApiProperty({ type: PaginationDto })
  pagination: PaginationDto;
}

export class AdminUserAddressesListResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: [Address] })
  data: Address[];

  @ApiProperty({ type: PaginationDto })
  pagination: PaginationDto;
}

export class AdminUsersListResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: [User] })
  data: User[];

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

  @ApiProperty({ required: false })
  messageAr?: string;

  @ApiProperty({ type: UserStatusSummaryDto })
  user: UserStatusSummaryDto;
}
