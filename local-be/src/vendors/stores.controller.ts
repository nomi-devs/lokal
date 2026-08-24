import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { VendorsService } from './vendors.service';
import { ListPublicVendorsQueryDto } from './dto/list-public-vendors-query.dto';
import {
  PublicVendorResponseDto,
  PublicVendorsListResponseDto,
  toPublicVendor,
} from './dto/public-vendor-response.dto';

// Public, unauthenticated: customer-app "Shop by Stores" browse and the
// Store Details page — a store is just a Vendor as the customer app sees
// it (see VendorsService.listPublic/findPublicByIdOrThrow, always
// active-only). Kept as its own controller, sharing the 'vendors' path
// with VendorsController, purely so it can carry its own Swagger tag
// ('Stores', see swagger-tags.constants.ts): a route's tags always include
// its whole class's @ApiTags, so there's no way for one method to opt out
// of the 'Vendors' tag VendorsController's registration/self-service
// routes need to stay dashboard-only.
@ApiTags('Stores')
@Controller('vendors')
export class StoresController {
  constructor(private readonly vendorsService: VendorsService) {}

  @ApiOkResponse({ type: PublicVendorsListResponseDto })
  @Get()
  async list(
    @Query() query: ListPublicVendorsQueryDto,
  ): Promise<PublicVendorsListResponseDto> {
    const { data, total } = await this.vendorsService.listPublic(query);
    return {
      success: true,
      data: data.map(toPublicVendor),
      pagination: { page: query.page, limit: query.limit, total },
    };
  }

  @ApiOkResponse({ type: PublicVendorResponseDto })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<PublicVendorResponseDto> {
    const vendor = await this.vendorsService.findPublicByIdOrThrow(id);
    return { success: true, vendor: toPublicVendor(vendor) };
  }
}
