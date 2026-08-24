import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
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
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/types/authenticated-user.type';
import { MessageResponseDto } from '../common/dto/message-response.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { MESSAGES } from '../common/constants/messages.constant';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import {
  AddressResponseDto,
  AddressesListResponseDto,
} from './dto/address-response.dto';

// Customer self-service address book. Scoped to the authenticated user's own
// addresses only — same shape as VendorProductsController's self-service
// pattern (ownership check lives in the service, not the controller).
@ApiTags('Addresses')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('customer')
@Controller('me/addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @ApiCreatedResponse({ type: AddressResponseDto })
  @Post()
  async create(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: CreateAddressDto,
  ): Promise<AddressResponseDto> {
    const address = await this.addressesService.createForUser(
      currentUser.userId,
      dto,
    );
    return { success: true, address };
  }

  @ApiOkResponse({ type: AddressesListResponseDto })
  @Get()
  async list(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Query() query: PaginationQueryDto,
  ): Promise<AddressesListResponseDto> {
    const { data, total } = await this.addressesService.findManyByUserId(
      currentUser.userId,
      query.page,
      query.limit,
    );
    return {
      success: true,
      data,
      pagination: { page: query.page, limit: query.limit, total },
    };
  }

  @ApiOkResponse({ type: AddressResponseDto })
  @Patch(':id')
  async update(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateAddressDto,
  ): Promise<AddressResponseDto> {
    const address = await this.addressesService.updateForUser(
      currentUser.userId,
      id,
      dto,
    );
    return { success: true, address };
  }

  @ApiOkResponse({ type: MessageResponseDto })
  @Delete(':id')
  async remove(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<MessageResponseDto> {
    await this.addressesService.removeForUser(currentUser.userId, id);
    return {
      success: true,
      message: MESSAGES.ADDRESS.DELETED.en,
      messageAr: MESSAGES.ADDRESS.DELETED.ar,
    };
  }

  @ApiOkResponse({ type: AddressResponseDto })
  @Patch(':id/primary')
  async setPrimary(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<AddressResponseDto> {
    const address = await this.addressesService.setPrimaryForUser(
      currentUser.userId,
      id,
    );
    return { success: true, address };
  }
}
