import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PromoCodeSchema,
  PromoCodeSchemaClass,
} from './entities/promo-code.schema';
import { PromoCodeRepository } from '../promo-code.repository';
import { PromoCodesDocumentRepository } from './repositories/promo-code.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PromoCodeSchemaClass.name, schema: PromoCodeSchema },
    ]),
  ],
  providers: [
    { provide: PromoCodeRepository, useClass: PromoCodesDocumentRepository },
  ],
  exports: [PromoCodeRepository],
})
export class DocumentPromoCodePersistenceModule {}
