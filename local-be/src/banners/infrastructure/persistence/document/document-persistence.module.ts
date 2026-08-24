import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BannerSchema, BannerSchemaClass } from './entities/banner.schema';
import { BannerRepository } from '../banner.repository';
import { BannersDocumentRepository } from './repositories/banner.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BannerSchemaClass.name, schema: BannerSchema },
    ]),
  ],
  providers: [
    { provide: BannerRepository, useClass: BannersDocumentRepository },
  ],
  exports: [BannerRepository],
})
export class DocumentBannerPersistenceModule {}
