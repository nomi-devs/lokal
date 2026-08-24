import {
  Body,
  Controller,
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
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/types/authenticated-user.type';
import { VendorsService } from '../vendors/vendors.service';
import { UsersService } from '../users/users.service';
import { ProductsService } from '../products/products.service';
import { ListVendorsQueryDto } from './dto/list-vendors-query.dto';
import { ListVendorProductsQueryDto } from './dto/list-vendor-products-query.dto';
import { AdminCreateVendorDto } from './dto/admin-create-vendor.dto';
import { UpdateVendorStatusDto } from './dto/update-vendor-status.dto';
import {
  AdminVendorDetailResponseDto,
  AdminVendorProductsListResponseDto,
  AdminVendorsListResponseDto,
  UpdateVendorStatusResponseDto,
} from './dto/admin-vendor-response.dto';
import { MESSAGES } from '../common/constants/messages.constant';

@ApiTags('Admin - Vendors')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/vendors')
export class AdminVendorsController {
  constructor(
    private readonly vendorsService: VendorsService,
    private readonly usersService: UsersService,
    private readonly productsService: ProductsService,
  ) {}

  @ApiOkResponse({ type: AdminVendorsListResponseDto })
  @Get()
  async list(
    @Query() query: ListVendorsQueryDto,
  ): Promise<AdminVendorsListResponseDto> {
    const { data, total } = await this.vendorsService.list(query);
    const owners = await Promise.all(
      data.map((v) => this.usersService.findById(v.userId)),
    );

    return {
      success: true,
      data: data.map((vendor, i) => ({
        id: vendor.id,
        storeName: vendor.storeName,
        ownerName: owners[i]
          ? `${owners[i].firstName} ${owners[i].lastName}`.trim()
          : undefined,
        ownerPhone: owners[i]?.phone,
        ownerEmail: owners[i]?.email,
        city: vendor.city,
        status: vendor.status,
        createdAt: vendor.createdAt,
        kycDocumentUrl: vendor.kycDocumentUrl,
        ...(vendor.status === 'pending_approval'
          ? { message: 'Awaiting approval' }
          : {}),
      })),
      pagination: { page: query.page, limit: query.limit, total },
    };
  }

  @ApiCreatedResponse({ type: AdminVendorDetailResponseDto })
  @Post()
  async create(
    @Body() dto: AdminCreateVendorDto,
  ): Promise<AdminVendorDetailResponseDto> {
    const vendor = await this.vendorsService.createByAdmin(dto);
    return { success: true, vendor };
  }

  @ApiOkResponse({ type: AdminVendorProductsListResponseDto })
  @Get(':id/products')
  async products(
    @Param('id') id: string,
    @Query() query: ListVendorProductsQueryDto,
  ): Promise<AdminVendorProductsListResponseDto> {
    const { data, total } = await this.productsService.findManyByVendorId(
      id,
      query.page,
      query.limit,
      query.categoryId,
    );
    return {
      success: true,
      data,
      pagination: { page: query.page, limit: query.limit, total },
    };
  }

  // One endpoint for every status transition — approve (status: 'active'),
  // reject (status: 'inactive'), suspend (status: 'suspended'). Previously
  // three separate PUT endpoints; see UpdateVendorStatusDto for which fields
  // apply to which status.
  @ApiOkResponse({ type: UpdateVendorStatusResponseDto })
  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateVendorStatusDto,
    @CurrentUser() admin: AuthenticatedUser,
  ): Promise<UpdateVendorStatusResponseDto> {
    const vendor = await this.vendorsService.updateStatus(
      id,
      admin.userId,
      dto,
    );
    const message =
      dto.status === 'active'
        ? MESSAGES.VENDOR.APPROVED
        : dto.status === 'inactive'
          ? MESSAGES.VENDOR.REJECTED
          : MESSAGES.VENDOR.SUSPENDED;
    return {
      success: true,
      message: message.en,
      messageAr: message.ar,
      vendor,
    };
  }
}
