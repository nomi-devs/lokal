import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SettingSchema, SettingSchemaClass } from './entities/setting.schema';
import { SettingRepository } from '../setting.repository';
import { SettingsDocumentRepository } from './repositories/setting.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SettingSchemaClass.name, schema: SettingSchema },
    ]),
  ],
  providers: [
    { provide: SettingRepository, useClass: SettingsDocumentRepository },
  ],
  exports: [SettingRepository],
})
export class DocumentSettingPersistenceModule {}
