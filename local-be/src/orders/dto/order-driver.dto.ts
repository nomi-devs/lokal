import { IsOptional, IsString, MinLength } from 'class-validator';

export class OrderDriverDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  @MinLength(1)
  phone: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;

  @IsOptional()
  @IsString()
  vehicleInfo?: string;
}
