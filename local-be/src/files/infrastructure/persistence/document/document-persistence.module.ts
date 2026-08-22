import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FileSchema, FileSchemaClass } from './entities/file.schema';
import { FileRepository } from '../file.repository';
import { FilesDocumentRepository } from './repositories/file.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FileSchemaClass.name, schema: FileSchema },
    ]),
  ],
  providers: [{ provide: FileRepository, useClass: FilesDocumentRepository }],
  exports: [FileRepository],
})
export class DocumentFilePersistenceModule {}
