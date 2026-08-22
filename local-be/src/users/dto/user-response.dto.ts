import { ApiProperty } from '@nestjs/swagger';
import { User } from '../domain/user';

export class UpdateProfileResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Profile updated successfully' })
  message: string;

  @ApiProperty({ type: User })
  user: User;
}
