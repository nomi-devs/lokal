import { Module } from '@nestjs/common';
import { WishlistsService } from './wishlists.service';
import { WishlistsController } from './wishlists.controller';
import { DocumentWishlistPersistenceModule } from './infrastructure/persistence/document/document-persistence.module';
import { ProductsModule } from '../products/products.module';
import { VendorsModule } from '../vendors/vendors.module';

@Module({
  imports: [DocumentWishlistPersistenceModule, ProductsModule, VendorsModule],
  controllers: [WishlistsController],
  providers: [WishlistsService],
  exports: [WishlistsService],
})
export class WishlistsModule {}
