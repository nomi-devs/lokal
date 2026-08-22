import { IsIn, IsString } from 'class-validator';

export class RegisterFcmTokenDto {
  @IsString()
  fcmToken: string;

  @IsIn(['ios', 'android'])
  device: 'ios' | 'android';
}
