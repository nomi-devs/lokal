import { Module } from '@nestjs/common';
import { WishlistsService } from './wishlists.service';
import { DocumentWishlistPersistenceModule } from './infrastructure/persistence/document/document-persistence.module';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [DocumentWishlistPersistenceModule, ProductsModule],
  providers: [WishlistsService],
  exports: [WishlistsService],
})
export class WishlistsModule {}
