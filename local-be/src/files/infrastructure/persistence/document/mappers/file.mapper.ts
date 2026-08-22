import { Types } from 'mongoose';
import { FileType } from '../../../../domain/file';
import { FileSchemaClass } from '../entities/file.schema';

export class FileMapper {
  static toDomain(raw: FileSchemaClass): FileType {
    const domainEntity = new FileType();
    domainEntity.id = raw._id.toString();
    domainEntity.key = raw.key;
    domainEntity.url = raw.url;
    domainEntity.contentType = raw.contentType;
    domainEntity.purpose = raw.purpose;
    domainEntity.uploadedBy = raw.uploadedBy.toString();
    domainEntity.createdAt = raw.createdAt as Date;
    return domainEntity;
  }

  static toPersistence(
    domainEntity: Omit<FileType, 'id' | 'createdAt'>,
  ): Partial<FileSchemaClass> {
    return {
      key: domainEntity.key,
      url: domainEntity.url,
      contentType: domainEntity.contentType,
      purpose: domainEntity.purpose,
      uploadedBy: new Types.ObjectId(domainEntity.uploadedBy),
    };
  }
}
