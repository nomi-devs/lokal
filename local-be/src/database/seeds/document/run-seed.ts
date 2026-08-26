import { NestFactory } from '@nestjs/core';
import { SeedModule } from './seed.module';
import { AdminSeedService } from './admin/admin-seed.service';
import { SettingsSeedService } from './settings/settings-seed.service';

async function runSeed() {
  const app = await NestFactory.createApplicationContext(SeedModule);

  await app.get(AdminSeedService).run();
  await app.get(SettingsSeedService).run();

  await app.close();
}

runSeed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
