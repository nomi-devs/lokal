import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { FaqsService } from './faqs.service';
import { ActiveFaqsResponseDto } from './dto/faq-response.dto';

@ApiTags('FAQ')
@Controller('faqs')
export class FaqController {
  constructor(private readonly faqsService: FaqsService) {}

  @ApiOkResponse({ type: ActiveFaqsResponseDto })
  @Get()
  async list(): Promise<ActiveFaqsResponseDto> {
    const data = await this.faqsService.findActive();
    return { success: true, data };
  }
}
