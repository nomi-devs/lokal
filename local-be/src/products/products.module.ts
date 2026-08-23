import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { DocumentProductPersistenceModule } from './infrastructure/persistence/document/document-persistence.module';

@Module({
  imports: [DocumentProductPersistenceModule],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
