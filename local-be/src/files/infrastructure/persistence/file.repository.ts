import { NullableType } from '../../../utils/types/nullable.type';
import { FileType } from '../../domain/file';

export abstract class FileRepository {
  abstract create(data: Omit<FileType, 'id' | 'createdAt'>): Promise<FileType>;
  abstract findById(id: string): Promise<NullableType<FileType>>;
  abstract findByIds(ids: string[]): Promise<FileType[]>;
}
