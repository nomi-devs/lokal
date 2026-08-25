import { ApiProperty } from '@nestjs/swagger';

class SavedCardDto {
  @ApiProperty({
    description:
      "Opaque MyFatoorah card token. Pass this back to the client SDK's submitCvv() to pay with this card, or to DELETE /me/payment-methods/cards/:token to remove it.",
  })
  token: string;

  @ApiProperty({ example: '512345xxxxxx0008' })
  maskedCardNumber: string;

  @ApiProperty({ example: 'Visa' })
  cardBrand: string;
}

class PaymentSessionDto {
  @ApiProperty({
    description:
      'Pass to the MyFatoorah client SDK to render the card-entry widget (new card) or, after submitCvv() on a saved card, to POST /orders as sessionId instead of paymentMethodId.',
  })
  sessionId: string;

  @ApiProperty()
  countryCode: string;

  @ApiProperty({ type: [SavedCardDto] })
  savedCards: SavedCardDto[];
}

export class PaymentSessionResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: PaymentSessionDto })
  session: PaymentSessionDto;
}
