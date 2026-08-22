import { IsIn, IsString, ValidateIf } from 'class-validator';

export class UpdateUserStatusDto {
  @IsIn(['active', 'inactive', 'suspended'])
  status: 'active' | 'inactive' | 'suspended';

  // Required only when suspending; ValidateIf skips validation entirely otherwise.
  @ValidateIf((dto: UpdateUserStatusDto) => dto.status === 'suspended')
  @IsString()
  reason?: string;
}
