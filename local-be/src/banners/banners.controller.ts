import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { BannersService } from './banners.service';
import { ActiveBannersResponseDto } from './dto/banner-response.dto';

@ApiTags('Banners')
@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @ApiOkResponse({ type: ActiveBannersResponseDto })
  @Get()
  async list(): Promise<ActiveBannersResponseDto> {
    const data = await this.bannersService.findActive();
    return { success: true, data };
  }
}
