import { ApiProperty } from '@nestjs/swagger';

class PaymentMethodDto {
  @ApiProperty()
  paymentMethodId: number;

  @ApiProperty()
  nameEn: string;

  @ApiProperty()
  nameAr: string;

  @ApiProperty()
  imageUrl: string;

  @ApiProperty()
  serviceCharge: number;

  @ApiProperty()
  totalAmount: number;
}

export class PaymentMethodsResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: [PaymentMethodDto] })
  data: PaymentMethodDto[];
}
