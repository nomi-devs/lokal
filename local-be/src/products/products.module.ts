import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { VendorProductsController } from './vendor-products.controller';
import { DocumentProductPersistenceModule } from './infrastructure/persistence/document/document-persistence.module';
import { CategoriesModule } from '../categories/categories.module';
import { VendorsModule } from '../vendors/vendors.module';
// Depends on the wishlist *persistence* module directly, not WishlistsModule
// — WishlistsModule already imports ProductsModule (WishlistsService needs
// ProductsService), so importing it back here would be circular. See
// ProductsService's isWishlisted annotation for why this is needed at all.
import { DocumentWishlistPersistenceModule } from '../wishlists/infrastructure/persistence/document/document-persistence.module';

@Module({
  imports: [
    DocumentProductPersistenceModule,
    CategoriesModule,
    VendorsModule,
    DocumentWishlistPersistenceModule,
  ],
  controllers: [ProductsController, VendorProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
