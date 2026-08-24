import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Put,
  Query,
  SerializeOptions,
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
import { AppException } from '../common/exceptions/app.exception';
import { ERROR_CODES } from '../common/exceptions/error-codes';
import { MessageResponseDto } from '../common/dto/message-response.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { UsersService } from '../users/users.service';
import { WishlistsService } from '../wishlists/wishlists.service';
import { AddressesService } from '../addresses/addresses.service';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { AdminCreateUserDto } from './dto/admin-create-user.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import {
  AdminUpdateUserStatusResponseDto,
  AdminUserAddressesListResponseDto,
  AdminUserDetailResponseDto,
  AdminUserWishlistListResponseDto,
  AdminUsersListResponseDto,
} from './dto/admin-user-response.dto';
import { MESSAGES } from '../common/constants/messages.constant';

@ApiTags('Admin - Users')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@SerializeOptions({ groups: ['admin'] })
@Controller('admin/users')
export class AdminUsersController {
  private readonly logger = new Logger(AdminUsersController.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly wishlistsService: WishlistsService,
    private readonly addressesService: AddressesService,
  ) {}

  @ApiOkResponse({ type: AdminUsersListResponseDto })
  @Get()
  async list(
    @Query() query: ListUsersQueryDto,
  ): Promise<AdminUsersListResponseDto> {
    const { data, total } = await this.usersService.list(query);

    return {
      success: true,
      data,
      pagination: { page: query.page, limit: query.limit, total },
    };
  }

  @ApiCreatedResponse({ type: AdminUserDetailResponseDto })
  @Post()
  async create(
    @Body() dto: AdminCreateUserDto,
  ): Promise<AdminUserDetailResponseDto> {
    const user = await this.usersService.createWithPassword({
      phone: dto.phone,
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      password: dto.password,
      role: dto.role,
      status: dto.status,
    });
    return { success: true, user };
  }

  @ApiOkResponse({ type: AdminUserDetailResponseDto })
  @Get(':id')
  async get(@Param('id') id: string): Promise<AdminUserDetailResponseDto> {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new AppException(ERROR_CODES.USER_NOT_FOUND, 'User not found', 404);
    }
    return { success: true, user };
  }

  @ApiOkResponse({ type: AdminUserWishlistListResponseDto })
  @Get(':id/wishlist')
  async wishlist(
    @Param('id') id: string,
    @Query() query: PaginationQueryDto,
  ): Promise<AdminUserWishlistListResponseDto> {
    const { data, total } = await this.wishlistsService.findManyByUserId(
      id,
      query.page,
      query.limit,
    );
    return {
      success: true,
      data,
      pagination: { page: query.page, limit: query.limit, total },
    };
  }

  @ApiOkResponse({ type: AdminUserAddressesListResponseDto })
  @Get(':id/addresses')
  async addresses(
    @Param('id') id: string,
    @Query() query: PaginationQueryDto,
  ): Promise<AdminUserAddressesListResponseDto> {
    const { data, total } = await this.addressesService.findManyByUserId(
      id,
      query.page,
      query.limit,
    );
    return {
      success: true,
      data,
      pagination: { page: query.page, limit: query.limit, total },
    };
  }

  @ApiOkResponse({ type: AdminUpdateUserStatusResponseDto })
  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
    @CurrentUser() admin: AuthenticatedUser,
  ): Promise<AdminUpdateUserStatusResponseDto> {
    const user = await this.usersService.updateStatus(
      id,
      dto.status,
      admin.userId,
    );
    return {
      success: true,
      message: MESSAGES.USER.STATUS_UPDATED.en,
      messageAr: MESSAGES.USER.STATUS_UPDATED.ar,
      user: { status: user.status },
    };
  }

  @ApiOkResponse({ type: MessageResponseDto })
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Body() dto: DeleteUserDto,
  ): Promise<MessageResponseDto> {
    // Cascading deletion of orders/payments (dto.deleteData) is deferred
    // until those modules exist; we still record why the account was removed.
    this.logger.log(
      `Hard-deleting user ${id}${dto.reason ? ` (reason: ${dto.reason})` : ''}`,
    );
    await this.usersService.hardDelete(id);
    return {
      success: true,
      message: MESSAGES.USER.DELETED.en,
      messageAr: MESSAGES.USER.DELETED.ar,
    };
  }
}
