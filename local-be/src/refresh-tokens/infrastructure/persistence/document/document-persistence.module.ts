import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  RefreshTokenSchema,
  RefreshTokenSchemaClass,
} from './entities/refresh-token.schema';
import { RefreshTokenRepository } from '../refresh-token.repository';
import { RefreshTokensDocumentRepository } from './repositories/refresh-token.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RefreshTokenSchemaClass.name, schema: RefreshTokenSchema },
    ]),
  ],
  providers: [
    {
      provide: RefreshTokenRepository,
      useClass: RefreshTokensDocumentRepository,
    },
  ],
  exports: [RefreshTokenRepository],
})
export class DocumentRefreshTokenPersistenceModule {}
