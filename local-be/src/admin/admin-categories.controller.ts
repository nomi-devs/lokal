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
import { CategoriesService } from '../categories/categories.service';
import { CreateCategoryDto } from '../categories/dto/create-category.dto';
import { UpdateCategoryDto } from '../categories/dto/update-category.dto';
import {
  CategoriesListResponseDto,
  CategoryResponseDto,
} from '../categories/dto/category-response.dto';
import { MESSAGES } from '../common/constants/messages.constant';

@ApiTags('Admin - Categories')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/categories')
export class AdminCategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @ApiOkResponse({ type: CategoriesListResponseDto })
  @Get()
  async list(
    @Query() query: PaginationQueryDto,
  ): Promise<CategoriesListResponseDto> {
    const { data, total } = await this.categoriesService.list(
      query.page,
      query.limit,
    );
    return {
      success: true,
      data,
      pagination: { page: query.page, limit: query.limit, total },
    };
  }

  @ApiOkResponse({ type: CategoryResponseDto })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<CategoryResponseDto> {
    const category = await this.categoriesService.findById(id);
    if (!category) {
      throw new AppException(
        ERROR_CODES.CATEGORY_NOT_FOUND,
        'Category not found',
        404,
      );
    }
    return { success: true, category };
  }

  @ApiCreatedResponse({ type: CategoryResponseDto })
  @Post()
  async create(@Body() dto: CreateCategoryDto): Promise<CategoryResponseDto> {
    const category = await this.categoriesService.create(dto);
    return { success: true, category };
  }

  @ApiOkResponse({ type: CategoryResponseDto })
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const category = await this.categoriesService.update(id, dto);
    return { success: true, category };
  }

  @ApiOkResponse({ type: MessageResponseDto })
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<MessageResponseDto> {
    await this.categoriesService.delete(id);
    return {
      success: true,
      message: MESSAGES.CATEGORY.DELETED.en,
      messageAr: MESSAGES.CATEGORY.DELETED.ar,
    };
  }
}
