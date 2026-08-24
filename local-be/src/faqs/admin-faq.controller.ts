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
import { FaqsService } from '../faqs/faqs.service';
import { CreateFaqDto } from '../faqs/dto/create-faq.dto';
import { UpdateFaqDto } from '../faqs/dto/update-faq.dto';
import {
  FaqResponseDto,
  FaqsListResponseDto,
} from '../faqs/dto/faq-response.dto';

@ApiTags('Admin - FAQ')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/faqs')
export class AdminFaqController {
  constructor(private readonly faqsService: FaqsService) {}

  @ApiOkResponse({ type: FaqsListResponseDto })
  @Get()
  async list(@Query() query: PaginationQueryDto): Promise<FaqsListResponseDto> {
    const { data, total } = await this.faqsService.list(
      query.page,
      query.limit,
    );
    return {
      success: true,
      data,
      pagination: { page: query.page, limit: query.limit, total },
    };
  }

  @ApiOkResponse({ type: FaqResponseDto })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<FaqResponseDto> {
    const faq = await this.faqsService.findById(id);
    if (!faq)
      throw new AppException(ERROR_CODES.FAQ_NOT_FOUND, 'FAQ not found', 404);
    return { success: true, faq };
  }

  @ApiCreatedResponse({ type: FaqResponseDto })
  @Post()
  async create(@Body() dto: CreateFaqDto): Promise<FaqResponseDto> {
    const faq = await this.faqsService.create(dto);
    return { success: true, faq };
  }

  @ApiOkResponse({ type: FaqResponseDto })
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateFaqDto,
  ): Promise<FaqResponseDto> {
    const faq = await this.faqsService.update(id, dto);
    return { success: true, faq };
  }

  @ApiOkResponse({ type: MessageResponseDto })
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<MessageResponseDto> {
    await this.faqsService.delete(id);
    return {
      success: true,
      message: 'FAQ deleted',
      messageAr: 'تم حذف السؤال الشائع',
    };
  }
}
