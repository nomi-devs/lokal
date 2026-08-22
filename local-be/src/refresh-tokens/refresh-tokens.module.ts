import { Module } from '@nestjs/common';
import { RefreshTokensService } from './refresh-tokens.service';
import { DocumentRefreshTokenPersistenceModule } from './infrastructure/persistence/document/document-persistence.module';

@Module({
  imports: [DocumentRefreshTokenPersistenceModule],
  providers: [RefreshTokensService],
  exports: [RefreshTokensService],
})
export class RefreshTokensModule {}
