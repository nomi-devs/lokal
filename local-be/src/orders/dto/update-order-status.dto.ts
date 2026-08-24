import { Type } from 'class-transformer';
import { IsIn, IsOptional, IsString, ValidateNested } from 'class-validator';
import { OrderDriverDto } from './order-driver.dto';

// Vendor-triggerable subset of the canonical order status enum — 'placed'
// is entered automatically at creation and 'cancelled' goes through the
// customer's own cancel endpoint, not this one (see OrdersService.VENDOR_
// ALLOWED_TRANSITIONS for why 'confirmed' is accepted but effectively
// always a no-op/rejected transition once payment has already confirmed
// the order).
export class UpdateOrderStatusDto {
  @IsIn(['confirmed', 'in_transit', 'delivered'])
  status: 'confirmed' | 'in_transit' | 'delivered';

  @IsOptional()
  @IsString()
  note?: string;

  // Assign/update the delivery driver shown on the customer's order
  // tracking view — normally sent alongside the confirmed -> in_transit
  // transition, but can also be resent with the *current* status just to
  // correct driver details (see OrdersService.updateStatusByVendor).
  @IsOptional()
  @ValidateNested()
  @Type(() => OrderDriverDto)
  driver?: OrderDriverDto;
}
