import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class DeleteUserDto {
  @IsOptional()
  @IsString()
  reason?: string;

  // Cascading deletion of orders/payments is deferred until those modules exist.
  @IsOptional()
  @IsBoolean()
  deleteData?: boolean;
}
