import { ApiProperty } from '@nestjs/swagger';
import { Banner } from '../domain/banner';
import { PaginationDto } from '../../common/dto/pagination-response.dto';

export class BannerResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: Banner })
  banner: Banner;

  @ApiProperty({ required: false })
  message?: string;

  @ApiProperty({ required: false })
  messageAr?: string;
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
