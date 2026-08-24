import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderSchema, OrderSchemaClass } from './entities/order.schema';
import {
  CheckoutSessionSchema,
  CheckoutSessionSchemaClass,
} from './entities/checkout-session.schema';
import { OrderRepository } from '../order.repository';
import { OrderDocumentRepository } from './repositories/order.repository';
import { CheckoutSessionRepository } from '../checkout-session.repository';
import { CheckoutSessionDocumentRepository } from './repositories/checkout-session.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OrderSchemaClass.name, schema: OrderSchema },
      {
        name: CheckoutSessionSchemaClass.name,
        schema: CheckoutSessionSchema,
      },
    ]),
  ],
  providers: [
    { provide: OrderRepository, useClass: OrderDocumentRepository },
    {
      provide: CheckoutSessionRepository,
      useClass: CheckoutSessionDocumentRepository,
    },
  ],
  exports: [OrderRepository, CheckoutSessionRepository],
})
export class DocumentOrdersPersistenceModule {}
