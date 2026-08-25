import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { AccountSecurityController } from './account-security.controller';
import { UsersService } from './users.service';
import { DocumentUserPersistenceModule } from './infrastructure/persistence/document/document-persistence.module';

@Module({
  imports: [DocumentUserPersistenceModule],
  controllers: [UsersController, AccountSecurityController],
  providers: [UsersService],
  exports: [UsersService, DocumentUserPersistenceModule],
})
export class UsersModule {}
