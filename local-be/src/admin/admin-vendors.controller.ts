import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/types/authenticated-user.type';
import { MessageResponseDto } from '../common/dto/message-response.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { VendorsService } from '../vendors/vendors.service';
import { UsersService } from '../users/users.service';
import { ProductsService } from '../products/products.service';
import { ListVendorsQueryDto } from './dto/list-vendors-query.dto';
import { ApproveVendorDto } from './dto/approve-vendor.dto';
import { RejectVendorDto } from './dto/reject-vendor.dto';
import { SuspendVendorDto } from './dto/suspend-vendor.dto';
import {
  AdminVendorProductsListResponseDto,
  AdminVendorsListResponseDto,
  ApproveVendorResponseDto,
  RejectVendorResponseDto,
} from './dto/admin-vendor-response.dto';

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

  @ApiOkResponse({ type: AdminVendorProductsListResponseDto })
  @Get(':id/products')
  async products(
    @Param('id') id: string,
    @Query() query: PaginationQueryDto,
  ): Promise<AdminVendorProductsListResponseDto> {
    const { data, total } = await this.productsService.findManyByVendorId(
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

  @ApiOkResponse({ type: ApproveVendorResponseDto })
  @Put(':id/approve')
  async approve(
    @Param('id') id: string,
    @Body() dto: ApproveVendorDto,
    @CurrentUser() admin: AuthenticatedUser,
  ): Promise<ApproveVendorResponseDto> {
    const vendor = await this.vendorsService.approve(
      id,
      admin.userId,
      dto.approvalNotes,
    );
    return {
      success: true,
      message: 'Vendor approved successfully',
      vendor: { status: vendor.status, approvedAt: vendor.approvedAt as Date },
    };
  }

  @ApiOkResponse({ type: RejectVendorResponseDto })
  @Put(':id/reject')
  async reject(
    @Param('id') id: string,
    @Body() dto: RejectVendorDto,
  ): Promise<RejectVendorResponseDto> {
    const vendor = await this.vendorsService.reject(
      id,
      dto.rejectionReason,
      dto.rejectionCategory,
    );
    return {
      success: true,
      message: 'Vendor rejected',
      vendor: {
        status: vendor.status,
        rejectionReason: vendor.rejectionReason as string,
      },
    };
  }

  @ApiOkResponse({ type: MessageResponseDto })
  @Put(':id/suspend')
  async suspend(
    @Param('id') id: string,
    @Body() dto: SuspendVendorDto,
  ): Promise<MessageResponseDto> {
    await this.vendorsService.suspend(id, dto.reason, dto.duration);
    return { success: true, message: 'Vendor suspended' };
  }
}
