import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CartSchema, CartSchemaClass } from './entities/cart.schema';
import { CartRepository } from '../cart.repository';
import { CartDocumentRepository } from './repositories/cart.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CartSchemaClass.name, schema: CartSchema },
    ]),
  ],
  providers: [{ provide: CartRepository, useClass: CartDocumentRepository }],
  exports: [CartRepository],
})
export class DocumentCartPersistenceModule {}
