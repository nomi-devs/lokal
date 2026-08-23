import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  WishlistSchema,
  WishlistSchemaClass,
} from './entities/wishlist.schema';
import { WishlistRepository } from '../wishlist.repository';
import { WishlistsDocumentRepository } from './repositories/wishlist.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WishlistSchemaClass.name, schema: WishlistSchema },
    ]),
  ],
  providers: [
    { provide: WishlistRepository, useClass: WishlistsDocumentRepository },
  ],
  exports: [WishlistRepository],
})
export class DocumentWishlistPersistenceModule {}
