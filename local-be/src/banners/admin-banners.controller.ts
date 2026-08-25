import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { MessageResponseDto } from '../common/dto/message-response.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { AppException } from '../common/exceptions/app.exception';
import { ERROR_CODES } from '../common/exceptions/error-codes';
import { BannersService } from '../banners/banners.service';
import { CreateBannerDto } from '../banners/dto/create-banner.dto';
import { UpdateBannerDto } from '../banners/dto/update-banner.dto';
import {
  BannerResponseDto,
  BannersListResponseDto,
} from '../banners/dto/banner-response.dto';
import { MESSAGES } from '../common/constants/messages.constant';

@ApiTags('Admin - Banners')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/banners')
export class AdminBannersController {
  constructor(private readonly bannersService: BannersService) {}

  @ApiOkResponse({ type: BannersListResponseDto })
  @Get()
  async list(
    @Query() query: PaginationQueryDto,
  ): Promise<BannersListResponseDto> {
    const { data, total } = await this.bannersService.list(
      query.page,
      query.limit,
    );
    return {
      success: true,
      data,
      pagination: { page: query.page, limit: query.limit, total },
    };
  }

  @ApiOkResponse({ type: BannerResponseDto })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<BannerResponseDto> {
    const banner = await this.bannersService.findById(id);
    if (!banner)
      throw new AppException(
        ERROR_CODES.BANNER_NOT_FOUND,
        'Banner not found',
        404,
      );
    return { success: true, banner };
  }

  @ApiCreatedResponse({ type: BannerResponseDto })
  @Post()
  async create(@Body() dto: CreateBannerDto): Promise<BannerResponseDto> {
    const banner = await this.bannersService.create(dto);
    return {
      success: true,
      banner,
      message: MESSAGES.BANNER.CREATED.en,
      messageAr: MESSAGES.BANNER.CREATED.ar,
    };
  }

  @ApiOkResponse({ type: BannerResponseDto })
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateBannerDto,
  ): Promise<BannerResponseDto> {
    const banner = await this.bannersService.update(id, dto);
    return {
      success: true,
      banner,
      message: MESSAGES.BANNER.UPDATED.en,
      messageAr: MESSAGES.BANNER.UPDATED.ar,
    };
  }

  @ApiOkResponse({ type: MessageResponseDto })
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<MessageResponseDto> {
    await this.bannersService.delete(id);
    return {
      success: true,
      message: MESSAGES.BANNER.DELETED.en,
      messageAr: MESSAGES.BANNER.DELETED.ar,
    };
  }
}
