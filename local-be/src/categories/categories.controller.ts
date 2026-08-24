import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { CategoriesService } from './categories.service';
import { CategoriesListResponseDto } from './dto/category-response.dto';

// Public, unauthenticated: consumed by the vendor dashboard's product-add
// form and by customer-app search/browse, so it only ever exposes the
// active subset (see AdminCategoriesController for the full admin CRUD set).
@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @ApiOkResponse({ type: CategoriesListResponseDto })
  @Get()
  async list(
    @Query() query: PaginationQueryDto,
  ): Promise<CategoriesListResponseDto> {
    const { data, total } = await this.categoriesService.findActive(
      query.page,
      query.limit,
    );
    return {
      success: true,
      data,
      pagination: { page: query.page, limit: query.limit, total },
    };
  }
}
