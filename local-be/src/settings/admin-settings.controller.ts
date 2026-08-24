import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
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
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/types/authenticated-user.type';
import { MessageResponseDto } from '../common/dto/message-response.dto';
import { SettingsService } from './settings.service';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import {
  SettingResponseDto,
  SettingsListResponseDto,
} from './dto/setting-response.dto';

// A record-keeping/visibility surface, not a live config source — actual
// app behavior stays driven by env vars via registerAs/*.config.ts (see
// CLAUDE.md), so changing a value here doesn't change runtime behavior.
@ApiTags('Admin - Settings')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/settings')
export class AdminSettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @ApiOkResponse({ type: SettingsListResponseDto })
  @Get()
  async list(): Promise<SettingsListResponseDto> {
    const data = await this.settingsService.list();
    return { success: true, data };
  }

  @ApiCreatedResponse({ type: SettingResponseDto })
  @Post()
  async create(@Body() dto: CreateSettingDto): Promise<SettingResponseDto> {
    const setting = await this.settingsService.create(dto);
    return { success: true, setting };
  }

  @ApiOkResponse({ type: SettingResponseDto })
  @Patch(':key')
  async update(
    @CurrentUser() admin: AuthenticatedUser,
    @Param('key') key: string,
    @Body() dto: UpdateSettingDto,
  ): Promise<SettingResponseDto> {
    const setting = await this.settingsService.update(admin.userId, key, dto);
    return { success: true, setting };
  }

  @ApiOkResponse({ type: MessageResponseDto })
  @Delete(':key')
  async remove(@Param('key') key: string): Promise<MessageResponseDto> {
    await this.settingsService.remove(key);
    return {
      success: true,
      message: 'Setting deleted',
      messageAr: 'تم حذف الإعداد',
    };
  }
}
