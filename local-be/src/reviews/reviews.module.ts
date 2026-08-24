import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { ProductReviewsController } from './product-reviews.controller';
import { VendorReviewsController } from './vendor-reviews.controller';
import { AdminReviewsController } from './admin-reviews.controller';
import { DocumentReviewPersistenceModule } from './infrastructure/persistence/document/document-persistence.module';
import { OrdersModule } from '../orders/orders.module';
import { ProductsModule } from '../products/products.module';
import { VendorsModule } from '../vendors/vendors.module';

@Module({
  imports: [
    DocumentReviewPersistenceModule,
    OrdersModule,
    ProductsModule,
    VendorsModule,
  ],
  controllers: [
    ReviewsController,
    ProductReviewsController,
    VendorReviewsController,
    AdminReviewsController,
  ],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
