import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../../../common/types/authenticated-user.type';
import { FilesS3PresignedService } from './files.service';
import { CreateUploadUrlDto } from './dto/create-upload-url.dto';
import { UploadUrlResponseDto } from './dto/upload-url-response.dto';

@ApiTags('Files')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('files')
export class FilesS3PresignedController {
  constructor(private readonly filesService: FilesS3PresignedService) {}

  @ApiCreatedResponse({ type: UploadUrlResponseDto })
  @Post('upload-url')
  async createUploadUrl(
    @Body() dto: CreateUploadUrlDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UploadUrlResponseDto> {
    const result = await this.filesService.createUploadUrl(
      dto.fileName,
      dto.contentType,
      dto.purpose,
      user.userId,
    );
    return { success: true, ...result };
  }
}
