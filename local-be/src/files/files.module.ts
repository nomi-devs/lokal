import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { DocumentFilePersistenceModule } from './infrastructure/persistence/document/document-persistence.module';
import { FilesS3PresignedModule } from './infrastructure/uploader/s3-presigned/files.module';

@Module({
  imports: [DocumentFilePersistenceModule, FilesS3PresignedModule],
  providers: [FilesService],
  exports: [FilesService, DocumentFilePersistenceModule],
})
export class FilesModule {}
