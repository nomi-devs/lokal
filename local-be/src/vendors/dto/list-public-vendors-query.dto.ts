import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

// Public, unauthenticated: customer-app "Shop by Stores" / store search
// (see ProductsController for the equivalent product-side query). Only ever
// surfaces active/approved vendors — see VendorsService.listPublic.
export class ListPublicVendorsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;
}
