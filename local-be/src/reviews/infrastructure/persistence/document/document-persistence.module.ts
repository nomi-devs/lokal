import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReviewSchema, ReviewSchemaClass } from './entities/review.schema';
import { ReviewRepository } from '../review.repository';
import { ReviewsDocumentRepository } from './repositories/review.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ReviewSchemaClass.name, schema: ReviewSchema },
    ]),
  ],
  providers: [
    { provide: ReviewRepository, useClass: ReviewsDocumentRepository },
  ],
  exports: [ReviewRepository],
})
export class DocumentReviewPersistenceModule {}
