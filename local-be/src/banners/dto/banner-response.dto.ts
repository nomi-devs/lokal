import { ApiProperty } from '@nestjs/swagger';
import { Banner } from '../domain/banner';

export class BannerResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: Banner })
  banner: Banner;
}

class PaginationDto {
  @ApiProperty() page: number;
  @ApiProperty() limit: number;
  @ApiProperty() total: number;
}

export class BannersListResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: [Banner] })
  data: Banner[];

  @ApiProperty({ type: PaginationDto })
  pagination: PaginationDto;
}

export class ActiveBannersResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: [Banner] })
  data: Banner[];
}
