import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { VendorProductsController } from './vendor-products.controller';
import { DocumentProductPersistenceModule } from './infrastructure/persistence/document/document-persistence.module';
import { CategoriesModule } from '../categories/categories.module';
import { VendorsModule } from '../vendors/vendors.module';

@Module({
  imports: [DocumentProductPersistenceModule, CategoriesModule, VendorsModule],
  controllers: [ProductsController, VendorProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
