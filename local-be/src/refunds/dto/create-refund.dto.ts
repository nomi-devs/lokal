import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
  ValidateNested,
} from 'class-validator';

class RefundBankAccountDto {
  @IsString()
  @Length(1, 200)
  accountHolder: string;

  @IsString()
  @Length(1, 50)
  accountNumber: string;

  @IsString()
  @Length(1, 100)
  bankName: string;

  @IsOptional()
  @IsString()
  @Length(1, 30)
  bankCode?: string;
}

// See RefundsService.submit — only a delivered order is eligible, and
// refundAmount is capped at that order's own total.
export class CreateRefundDto {
  @IsString()
  orderId: string;

  @IsNumber()
  @Min(0.01)
  refundAmount: number;

  @IsString()
  @Length(1, 200)
  refundReason: string;

  @IsOptional()
  @IsString()
  @Length(1, 1000)
  customerExplanation?: string;

  @ValidateNested()
  @Type(() => RefundBankAccountDto)
  bankAccount: RefundBankAccountDto;
}
