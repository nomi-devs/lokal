import { registerAs } from '@nestjs/config';
import { IsNumber, IsOptional, Min } from 'class-validator';
import validateConfig from '../../utils/validate-config';
import { CartConfig } from './cart-config.type';

class EnvironmentVariablesValidator {
  @IsNumber()
  @Min(0)
  @IsOptional()
  CART_DELIVERY_FEE: number;
}

export default registerAs<CartConfig>('cart', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    // Flat delivery fee applied to every order regardless of vendor split —
    // see Module 12 (checkout) for where this feeds into order totals.
    deliveryFee: process.env.CART_DELIVERY_FEE
      ? parseFloat(process.env.CART_DELIVERY_FEE)
      : 15,
  };
});
