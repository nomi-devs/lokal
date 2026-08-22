import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../../../users/users.service';
import { AdminSeedConfig } from './admin-seed-config.type';

@Injectable()
export class AdminSeedService {
  private readonly logger = new Logger(AdminSeedService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService<{
      adminSeed: AdminSeedConfig;
    }>,
  ) {}

  async run(): Promise<void> {
    const config = this.configService.getOrThrow('adminSeed', { infer: true });

    const existing = await this.usersService.findByPhone(config.phone);
    if (existing) {
      this.logger.log(
        `Admin account already exists: ${config.phone} (no changes made)`,
      );
      return;
    }

    await this.usersService.createWithPassword({
      phone: config.phone,
      email: config.email,
      firstName: config.firstName,
      lastName: config.lastName,
      password: config.password,
      role: 'admin',
    });

    this.logger.log(`Admin account created: ${config.phone}`);
  }
}
