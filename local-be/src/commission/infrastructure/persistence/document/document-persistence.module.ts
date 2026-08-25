import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PlatformCommissionSchema,
  PlatformCommissionSchemaClass,
} from './entities/platform-commission.schema';
import { PlatformCommissionRepository } from '../platform-commission.repository';
import { PlatformCommissionDocumentRepository } from './repositories/platform-commission.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: PlatformCommissionSchemaClass.name,
        schema: PlatformCommissionSchema,
      },
    ]),
  ],
  providers: [
    {
      provide: PlatformCommissionRepository,
      useClass: PlatformCommissionDocumentRepository,
    },
  ],
  exports: [PlatformCommissionRepository],
})
export class DocumentCommissionPersistenceModule {}
